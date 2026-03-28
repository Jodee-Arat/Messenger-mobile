const fs = require('fs');
const filePath = 'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\home\\\\groups\\\\useGroupsSidebar.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/\\tconst fadeAnim = useRef\\(new Animated\\.Value\\(0\\)\\)\\.current\\r?\\n/, '');

code = code.replace(
	/Animated\\.parallel\\(\\[\\s*Animated\\.spring\\([^}]+\\}\\),\\s*Animated\\.timing\\([^}]+\\}\\)\\s*\\]\\)\\.start\\(\\)/g,
	`Animated.spring(slideAnim, {
					toValue: 0,
					useNativeDriver: true,
					tension: 65,
					friction: 11
				}).start()`
);

code = code.replace(
	/Animated\\.parallel\\(\\[\\s*Animated\\.timing\\(slideAnim[^}]+\\}\\),\\s*Animated\\.timing\\(fadeAnim[^}]+\\}\\)\\s*\\]\\)\\.start\\(\\(\\)\\s*=>\\s*setShowModal\\(false\\)\\)/g,
	`Animated.timing(slideAnim, {
					toValue: -SIDEBAR_WIDTH,
					duration: 200,
					useNativeDriver: true
				}).start(() => setShowModal(false))`
);

code = code.replace(/\\tslideAnim,\\r?\\n\\t\\tfadeAnim,/g, '\tslideAnim,');

fs.writeFileSync(filePath, code, 'utf8');
console.log('Patched useGroupsSidebar.ts successfully');
