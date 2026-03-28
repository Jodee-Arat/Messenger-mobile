const fs = require('fs');

try {
const files = [
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\chats-list\\\\CreateChatModal.tsx',
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\home\\\\groups\\\\CreateGroupModal.tsx',
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\chat\\\\message\\\\default\\\\list\\\\ForwardMessageModal.tsx',
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\chat\\\\message\\\\secret\\\\list\\\\ForwardMessageModal.tsx',
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\chat\\\\FingerprintVerificationModal.tsx'
];

files.forEach(path => {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Animation type none
    content = content.replace(/animationType='slide'/g, "animationType='none'");

    // ensure Animated, Dimensions
    if (!content.includes('Animated,') && !content.includes('Animated ')) {
        content = content.replace("import {", "import { Animated, Dimensions,");
    }

    if (!content.includes('Pressable,')) {
        content = content.replace("import {", "import { Pressable,");
    }
    
    // ensure useRef
    if (!content.includes('useRef')) {
        content = content.replace("useEffect,", "useEffect, useRef,");
    }

    // 2. Add SCREEN_HEIGHT
    if (!content.includes('const SCREEN_HEIGHT')) {
        content = content.replace(/(const \w+\s*:\s*FC<[^>]+>\s*=\s*\([^)]+\)\s*=>\s*\{)/, 
            'const SCREEN_HEIGHT = Dimensions.get("window").height\n\n$1');
    }

    // 3. Add slideAnim and logic
    if (!content.includes('const closeSheet')) {
        let visible_prop = content.includes('isOpen =') || content.includes('isOpen,') ? 'isOpen' : 'visible';
        let close_func = content.includes('setIsOpen') ? 'setIsOpen(false)' : 'onClose()';
        
        let targetRegex = /(const \w+\s*:\s*FC<[^>]+>\s*=\s*\([^)]+\)\s*=>\s*\{\n(?:.+\n)+?\s*const \{\s*colors\s*\}\s*=\s*useTheme\(\)\n(?:.+\n)+?)(?=\s*const .*)/;
        
        // Let's just insert it after colors or t
        content = content.replace(/(const \{ colors \} = useTheme\(\)\n\s*const \{ t \} = useTranslation\(\)\n)/,
            `$1\tconst slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;\n\n\tconst closeSheet = (cb?: () => void) => {\n\t\tAnimated.timing(slideAnim, {\n\t\t\ttoValue: SCREEN_HEIGHT,\n\t\t\tduration: 200,\n\t\t\tuseNativeDriver: true\n\t\t}).start(() => {\n\t\t\t${close_func};\n\t\t\tcb?.();\n\t\t})\n\t};\n\n\tuseEffect(() => {\n\t\tif (${visible_prop}) {\n\t\t\tAnimated.spring(slideAnim, {\n\t\t\t\ttoValue: 0,\n\t\t\t\tuseNativeDriver: true,\n\t\t\t\ttension: 65,\n\t\t\t\tfriction: 11\n\t\t\t}).start()\n\t\t}\n\t}, [${visible_prop}]);\n\n`);

        if (close_func === 'setIsOpen(false)') {
            content = content.replace(/setIsOpen\(false\)/g, "closeSheet()");
            content = content.replace(/setIsOpen\(false\);/g, "closeSheet();");
            content = content.replace("closeSheet()", "setIsOpen(false)"); // inside closeSheet
            content = content.replace("closeSheet();", "setIsOpen(false);");
            // Fix double closeSheet inside closeSheet if it occurred
        } else {
            content = content.replace(/onClose\(\)/g, "closeSheet()");
            content = content.replace(/onClose\(false\)/g, "closeSheet()");
            content = content.replace("closeSheet()", "onClose()"); 
            content = content.replace("closeSheet();", "onClose();");
        }
    }

    // Overlays logic
    // CreateChatModal
    content = content.replace(
        /className='flex-1 justify-end'\s*style=\{\{\s*backgroundColor: colors\.overlay,\s*paddingBottom: containerPaddingBottom\s*\}\}\s*>\s*<View/g,
        `className='flex-1 justify-end' style={{ paddingBottom: containerPaddingBottom }}>\n\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={() => closeSheet()} />\n\t\t\t\t<Animated.View`
    );

    // ForwardMessageModal
    content = content.replace(
        /className='flex-1 justify-center'\s*style=\{\{\s*backgroundColor: colors\.overlay\s*\}\}\s*>\s*<View/g,
        `className='flex-1 justify-center'>\n\t\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={() => closeSheet()} />\n\t\t\t\t\t<Animated.View`
    );

    // FingerprintVerificationModal
    // Has a specific style block.
    content = content.replace(
        /className='flex-1 justify-end'\s*style=\{\{\s*backgroundColor:\s*'rgba\(0,0,0,0\.5\)'\s*\}\}\s*onPress=\{[^\}]+\}\s*>\s*<Pressable/g,
        `className='flex-1 justify-end'>\n\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => closeSheet()} />\n\t\t\t\t<Animated.View`
    );

    // Close Animated.Views - we only do this once at the bottom end of </AppModal>'s child.
    // Instead of Regex over the whole file which is greedy, we replace the last `</View>` before `</AppModal>`
    // First, verify if `<Animated.View` exists and `</Animated.View>` doesn't.
    if (content.includes('<Animated.View') && !content.includes('</Animated.View>')) {
        let lines = content.split('\\n');
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('</AppModal>')) {
                // Find the View/Pressable above it that we need to change to Animated.View 
                for (let j = i - 1; j >= i - 5; j--) {
                    if (lines[j].includes('</View>')) {
                        lines[j] = lines[j].replace('</View>', '</Animated.View>');
                        break;
                    }
                    if (lines[j].includes('</Pressable>')) {
                        lines[j] = lines[j].replace('</Pressable>', '</Animated.View>');
                        break;
                    }
                }
                break;
            }
        }
        content = lines.join('\\n');
    }

    fs.writeFileSync(path, content, 'utf8');
});

console.log("Successfully patched everything.");
} catch(e) {
    console.error(e);
}
