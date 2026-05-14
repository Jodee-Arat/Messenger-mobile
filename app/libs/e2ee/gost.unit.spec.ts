import {
	buildInitEnvelope,
	buildSessionMsgEnvelope,
	checkMyPreKeys,
	createDmRatchetReceiverStateFromX3DH,
	createDmRatchetStateFromX3DH,
	decryptDmRatchetMessage,
	decryptKuz,
	decryptSessionMsgEnvelope,
	encryptDmRatchetMessage,
	encryptKuz,
	establishSessionX3DH,
	exportPrivateRaw,
	exportPublicRaw,
	finalizeFromEnvelope,
	finalizeSessionX3DH,
	fromHex,
	generateEphemeralKeyPair,
	generateIdentityKeyPair,
	generateKuznechikKey,
	generatePreKey,
	getFingerprint,
	importPrivateRaw,
	importPublicRaw,
	signBytes,
	toHex,
	utf8,
	verifyBytes
} from './gost'

jest.setTimeout(120000)

const expectHex = (value: string, minBytes = 1) => {
	expect(value).toMatch(/^[0-9a-f]+$/)
	expect(value.length % 2).toBe(0)
	expect(value.length).toBeGreaterThanOrEqual(minBytes * 2)
}

const expectBytesEqual = (actual: Uint8Array, expected: Uint8Array) => {
	expect(toHex(actual)).toBe(toHex(expected))
}

async function createX3dhFixture() {
	const aliceIdentity = await generateIdentityKeyPair()
	const aliceEphemeral = await generateEphemeralKeyPair()
	const bobPreKey = await generatePreKey()
	const bobBundle = {
		ikPub: bobPreKey.toServer.ikPub,
		spkPub: bobPreKey.toServer.spkPub,
		spkSig: bobPreKey.toServer.spkSig,
		opk: bobPreKey.toServer.opkPubs[0]
	}

	return {
		aliceIdentity,
		aliceEphemeral,
		aliceIdentityPubHex: toHex(await exportPublicRaw(aliceIdentity.publicKey)),
		bobBundle,
		bobIdentityPrivate: await importPrivateRaw(fromHex(bobPreKey.toStore.ikPriv)),
		bobSignedPreKeyPrivate: await importPrivateRaw(
			fromHex(bobPreKey.toStore.spkPriv)
		),
		bobOneTimePreKeyPrivate: await importPrivateRaw(
			fromHex(bobPreKey.toStore.opkPriv[0])
		),
		bobPreKey
	}
}

describe('mobile E2EE GOST primitives', () => {
	it('generates a pre-key bundle with verifiable signed pre-key material', async () => {
		const preKey = await generatePreKey()
		const identityPublicKey = await importPublicRaw(fromHex(preKey.toServer.ikPub))

		expectHex(preKey.toServer.ikPub, 64)
		expectHex(preKey.toServer.spkPub, 64)
		expectHex(preKey.toServer.spkSig, 64)
		expect(preKey.toServer.opkPubs).toHaveLength(3)
		preKey.toServer.opkPubs.forEach(value => expectHex(value, 64))
		expectHex(preKey.toStore.ikPriv, 32)
		expectHex(preKey.toStore.spkPriv, 32)
		expect(preKey.toStore.opkPriv).toHaveLength(3)

		await expect(
			verifyBytes(
				identityPublicKey,
				fromHex(preKey.toServer.spkPub),
				fromHex(preKey.toServer.spkSig)
			)
		).resolves.toBe(true)
	})

	it('derives the same X3DH session key on both sides', async () => {
		const fixture = await createX3dhFixture()
		const aliceSession = await establishSessionX3DH({
			IK: fixture.aliceIdentity,
			aliceEK: fixture.aliceEphemeral,
			bobBundle: fixture.bobBundle,
			ukm: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
		})
		const bobSession = await finalizeSessionX3DH({
			bobIKPriv: fixture.bobIdentityPrivate,
			bobSPKPriv: fixture.bobSignedPreKeyPrivate,
			opkPriv: fixture.bobOneTimePreKeyPrivate,
			envelope: {
				ikAPub: fixture.aliceIdentityPubHex,
				ekAPub: toHex(await exportPublicRaw(fixture.aliceEphemeral.publicKey)),
				usedOpk: fixture.bobBundle.opk,
				ukm: toHex(aliceSession.ukm)
			}
		})

		expect(aliceSession.verifiedSpk).toBe(true)
		expectBytesEqual(aliceSession.sessionKey, bobSession.sessionKey)
	})

	it('encrypts in Kuznechik CTR mode and rejects tampered MAC data', async () => {
		const { keyBytes } = await generateKuznechikKey()
		const plaintext = utf8('authenticated CTR payload')
		const encrypted = await encryptKuz(keyBytes, plaintext)

		const decrypted = await decryptKuz(
			keyBytes,
			encrypted.iv,
			encrypted.ciphertext
		)
		expectBytesEqual(decrypted, plaintext)

		const tamperedCiphertext = new Uint8Array(encrypted.ciphertext)
		tamperedCiphertext[0] ^= 1

		await expect(
			decryptKuz(keyBytes, encrypted.iv, tamperedCiphertext)
		).rejects.toThrow('MAC')
	})

	it('creates and verifies digital signatures for message bytes', async () => {
		const identity = await generateIdentityKeyPair()
		const data = utf8('signed material')
		const signature = await signBytes(identity.privateKey, data)

		await expect(verifyBytes(identity.publicKey, data, signature)).resolves.toBe(
			true
		)

		const tamperedData = utf8('signed materiaL')
		await expect(
			verifyBytes(identity.publicKey, tamperedData, signature)
		).resolves.toBe(false)
	})

	it('wraps and unwraps X3DH init envelopes with signature verification', async () => {
		const fixture = await createX3dhFixture()
		const message = 'initial X3DH message'
		const built = await buildInitEnvelope({
			IK: fixture.aliceIdentity,
			bobBundle: fixture.bobBundle,
			plaintext: message,
			ukm: new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1])
		})
		const finalized = await finalizeFromEnvelope({
			bobIKPriv: fixture.bobIdentityPrivate,
			bobSPKPriv: fixture.bobSignedPreKeyPrivate,
			opkPriv: fixture.bobOneTimePreKeyPrivate,
			envelope: built.envelope
		})

		expect(built.verifiedSpk).toBe(true)
		expect(finalized.sigOk).toBe(true)
		expect(finalized.decrypted).toBe(message)
		expectBytesEqual(finalized.sessionKey, built.sessionKey)
	})

	it('wraps and unwraps post-X3DH session messages with signature verification', async () => {
		const fixture = await createX3dhFixture()
		const aliceSession = await establishSessionX3DH({
			IK: fixture.aliceIdentity,
			aliceEK: fixture.aliceEphemeral,
			bobBundle: fixture.bobBundle
		})
		const message = 'session message after X3DH'
		const { envelope } = await buildSessionMsgEnvelope({
			sessionKey: aliceSession.sessionKey,
			plaintext: message,
			signerIKPriv: fixture.aliceIdentity.privateKey
		})

		const decrypted = await decryptSessionMsgEnvelope({
			sessionKey: aliceSession.sessionKey,
			envelope,
			senderIkPub: fixture.aliceIdentityPubHex
		})

		expect(decrypted.decrypted).toBe(message)
		expect(decrypted.sigOk).toBe(true)
	})

	it('computes stable fingerprints and detects changed pre-key material', async () => {
		const first = await generatePreKey()
		const second = await generatePreKey()

		const firstFingerprint = await getFingerprint(
			first.toServer.ikPub,
			first.toServer.spkPub
		)
		const repeatedFingerprint = await getFingerprint(
			first.toServer.ikPub,
			first.toServer.spkPub
		)
		const secondFingerprint = await getFingerprint(
			second.toServer.ikPub,
			second.toServer.spkPub
		)

		expectHex(firstFingerprint, 32)
		expect(firstFingerprint).toBe(repeatedFingerprint)
		expect(firstFingerprint).not.toBe(secondFingerprint)
		await expect(
			checkMyPreKeys(first.toServer, {
				ikPub: first.toServer.ikPub,
				spkPub: first.toServer.spkPub
			})
		).resolves.toBe(true)
		await expect(
			checkMyPreKeys(first.toServer, {
				ikPub: second.toServer.ikPub,
				spkPub: second.toServer.spkPub
			})
		).resolves.toBe(false)
	})

	it('advances Double Ratchet chains, decrypts both directions, and rejects replay', async () => {
		const chatId = 'chat-1'
		const aliceSessionId = 'alice-session'
		const bobSessionId = 'bob-session'
		const aliceIdentity = await generateIdentityKeyPair()
		const bobIdentity = await generateIdentityKeyPair()
		const aliceIdentityPubHex = toHex(await exportPublicRaw(aliceIdentity.publicKey))
		const bobIdentityPubHex = toHex(await exportPublicRaw(bobIdentity.publicKey))
		const bobInitialRatchet = await generateEphemeralKeyPair()
		const bobInitialRatchetPub = toHex(
			await exportPublicRaw(bobInitialRatchet.publicKey)
		)
		const bobInitialRatchetPriv = toHex(
			await exportPrivateRaw(bobInitialRatchet.privateKey)
		)
		const sessionKey = new Uint8Array(32)
		sessionKey.fill(7)

		const aliceInitialState = await createDmRatchetStateFromX3DH({
			peerSessionId: bobSessionId,
			sessionKey,
			remoteRatchetPub: bobInitialRatchetPub
		})
		const aliceFirst = await encryptDmRatchetMessage({
			chatId,
			fromSessionId: aliceSessionId,
			toSessionId: bobSessionId,
			state: aliceInitialState,
			plaintext: 'first ratchet message',
			signerIKPriv: aliceIdentity.privateKey
		})
		const bobInitialState = await createDmRatchetReceiverStateFromX3DH({
			peerSessionId: aliceSessionId,
			sessionKey,
			ownRatchetPriv: bobInitialRatchetPriv,
			ownRatchetPub: bobInitialRatchetPub,
			header: aliceFirst.header
		})
		const bobFirst = await decryptDmRatchetMessage({
			chatId,
			fromSessionId: aliceSessionId,
			toSessionId: bobSessionId,
			state: bobInitialState,
			header: aliceFirst.header,
			envelope: aliceFirst.envelope,
			senderIkPub: aliceIdentityPubHex
		})

		expect(bobFirst.decrypted).toBe('first ratchet message')
		expect(aliceFirst.nextState.sendChainKey).not.toBe(
			aliceInitialState.sendChainKey
		)
		await expect(
			decryptDmRatchetMessage({
				chatId,
				fromSessionId: aliceSessionId,
				toSessionId: bobSessionId,
				state: bobFirst.nextState,
				header: aliceFirst.header,
				envelope: aliceFirst.envelope,
				senderIkPub: aliceIdentityPubHex
			})
		).rejects.toThrow(/already consumed|signature|MAC/)

		const bobReply = await encryptDmRatchetMessage({
			chatId,
			fromSessionId: bobSessionId,
			toSessionId: aliceSessionId,
			state: bobFirst.nextState,
			plaintext: 'reply after DH ratchet',
			signerIKPriv: bobIdentity.privateKey
		})
		const aliceReply = await decryptDmRatchetMessage({
			chatId,
			fromSessionId: bobSessionId,
			toSessionId: aliceSessionId,
			state: aliceFirst.nextState,
			header: bobReply.header,
			envelope: bobReply.envelope,
			senderIkPub: bobIdentityPubHex
		})

		expect(aliceReply.decrypted).toBe('reply after DH ratchet')
		expect(bobReply.nextState.rootKey).not.toBe(bobFirst.nextState.rootKey)
		expect(bobReply.nextState.ownRatchetPub).not.toBe(
			bobFirst.nextState.ownRatchetPub
		)
		expect(aliceReply.nextState.rootKey).not.toBe(aliceFirst.nextState.rootKey)
		expect(aliceReply.nextState.remoteRatchetPub).toBe(bobReply.header.dhPub)
		expect(aliceReply.nextState.recvCount).toBe(1)
	})
})
