// src/types/extract-files.d.ts
declare module 'extract-files' {
	export class ReactNativeFile {
		constructor(opts: { uri: string; name?: string; type?: string })
		uri: string
		name?: string
		type?: string
	}

	export function isExtractableFile(value: any): boolean

	export default ReactNativeFile
}
