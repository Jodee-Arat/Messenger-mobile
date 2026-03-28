const fs = require('fs');

try {
const files = [
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\chats-list\\\\CreateChatModal.tsx',
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\home\\\\groups\\\\CreateGroupModal.tsx',
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\chat\\\\message\\\\default\\\\list\\\\ForwardMessageModal.tsx',
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\chat\\\\message\\\\secret\\\\list\\\\ForwardMessageModal.tsx',
    'd:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\app\\\\components\\\\screens\\\\chat\\\\FingerprintVerificationModal.tsx'
];

let log = '';

files.forEach(path => {
    log += `Processing ${path}\\n`;
    if (!fs.existsSync(path)) {
        log += `File not found!\\n`;
        return;
    }
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
    if (!content.includes('useRef,') && !content.includes(' useRef ')) {
        content = content.replace("useEffect,", "useEffect, useRef,");
    }

    // 2. Add SCREEN_HEIGHT
    if (!content.includes('const SCREEN_HEIGHT')) {
        content = content.replace(/(const \w+\s*:\s*FC<[^>]+>\s*=\s*\([^)]+\)\s*=>\s*\{)/, 
            'const SCREEN_HEIGHT = Dimensions.get("window").height\n\n$1');
    }

    // 3. Add slideAnim and logic
    if (!content.includes('const closeSheet')) {
        let visible_prop = content.includes('isOpen =') || content.includes('isOpen,') || content.includes('isOpen:') ? 'isOpen' : 'visible';
        let close_func = content.includes('setIsOpen') ? 'setIsOpen(false)' : 'onClose()';
        
        let insertCode = `\tconst slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;\n\n\tconst closeSheet = (cb?: () => void) => {\n\t\tAnimated.timing(slideAnim, {\n\t\t\ttoValue: SCREEN_HEIGHT,\n\t\t\tduration: 200,\n\t\t\tuseNativeDriver: true\n\t\t}).start(() => {\n\t\t\t${close_func};\n\t\t\tcb?.();\n\t\t})\n\t};\n\n\tuseEffect(() => {\n\t\tif (${visible_prop}) {\n\t\t\tAnimated.spring(slideAnim, {\n\t\t\t\ttoValue: 0,\n\t\t\t\tuseNativeDriver: true,\n\t\t\t\ttension: 65,\n\t\t\t\tfriction: 11\n\t\t\t}).start()\n\t\t}\n\t}, [${visible_prop}]);\n\n`;
        
        // Find a good place to insert - after `const { t } = useTranslation()`
        if (content.includes('useTranslation()')) {
            content = content.replace(/(const .* = useTranslation\(\)[^\n]*\n)/, `$1\n${insertCode}`);
        } else {
            // fallback
            content = content.replace(/(const { colors } = useTheme\(\)[^\n]*\n)/, `$1\n${insertCode}`);
        }

        if (close_func === 'setIsOpen(false)') {
            content = content.replace(/setIsOpen\(false\)/g, "closeSheet()");
            content = content.replace(/setIsOpen\(false\);/g, "closeSheet();");
            content = content.replace("closeSheet()", "setIsOpen(false)"); // fix inside closeSheet
            content = content.replace("closeSheet();", "setIsOpen(false);");
            // double fix just in case it wasn't replaced yet
            content = content.replace(/setIsOpen\(false\)/g, "closeSheet()");
            content = content.replace("closeSheet()", "setIsOpen(false)"); // inside closeSheet
            
            // special check for forms and loading
            content = content.replace(/closeSheet\(\)([\s\S]*?)form.reset\(\)/g, "closeSheet(() => {\n\t\t\t\tform.reset()\n\t\t\t})");
        } else {
            content = content.replace(/onClose\(\)/g, "closeSheet()");
            content = content.replace(/onClose\(false\)/g, "closeSheet()");
            content = content.replace("closeSheet()", "onClose()"); // inside closeSheet
            content = content.replace("closeSheet();", "onClose();");
        }
    }

    // Overlays logic
    // CreateChatModal, CreateGroupModal
    content = content.replace(
        /className='flex-1 justify-end'[\s]*style=\{\{[\s]*backgroundColor: colors\.overlay,[\s]*paddingBottom: containerPaddingBottom[\s]*\}\}[\s]*>[\s]*<View/g,
        `className='flex-1 justify-end' style={{ paddingBottom: containerPaddingBottom }}>\n\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={() => closeSheet()} />\n\t\t\t\t<Animated.View`
    );

    // ForwardMessageModal
    content = content.replace(
        /className='flex-1 justify-center'[\s]*style=\{\{\s*backgroundColor: colors\.overlay\s*\}\}[\s]*>[\s]*<View/g,
        `className='flex-1 justify-center'>\n\t\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={() => closeSheet()} />\n\t\t\t\t\t<Animated.View`
    );

    // FingerprintVerificationModal
    content = content.replace(
        /<Pressable[\s]+className='flex-1 justify-end'[\s]*style=\{\{\s*backgroundColor:\s*'rgba\(0,0,0,0\.5\)'\s*\}\}[\s]*onPress=\{onClose\}[\s]*>[\s]*<Pressable/g,
        `<View className='flex-1 justify-end'>\n\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => closeSheet()} />\n\t\t\t\t<Animated.View`
    );
    
    // Quick and dirty regex for the final close View
    if (content.includes('<Animated.View') && !content.includes('</Animated.View>')) {
        let lines = content.split('\\n');
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('</AppModal>')) {
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
    log += `Patched successfully\\n`;
});

fs.writeFileSync('d:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\patch_logs.txt', log, 'utf8');

} catch(e) {
    fs.writeFileSync('d:\\\\ararat\\\\vs\\\\messenger\\\\apps\\\\mobile\\\\patch_err.txt', e.toString() + "\\n" + e.stack, 'utf8');
}
