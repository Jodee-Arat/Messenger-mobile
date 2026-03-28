const fs = require('fs');

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
    if (!content.includes('Animated') && !content.includes('Dimensions')) {
        content = content.replace("import {", "import { Animated, Dimensions,");
    } else {
        if (!content.includes('Animated')) content = content.replace("Dimensions", "Animated, Dimensions");
        if (!content.includes('Dimensions')) content = content.replace("Animated", "Animated, Dimensions");
    }

    if (!content.includes('Pressable')) {
        content = content.replace("import {", "import { Pressable,");
    }

    // 2. Add SCREEN_HEIGHT
    if (!content.includes('const SCREEN_HEIGHT')) {
        content = content.replace(/(const \w+\s*:\s*FC<[^>]+>\s*=\s*\([^)]+\)\s*=>\s*\{)/, 
            'const SCREEN_HEIGHT = Dimensions.get("window").height\n\n$1');
    }

    // 3. Add slideAnim and logic
    if (!content.includes('slideAnim = useRef')) {
        let visible_prop = content.includes('isOpen =') || content.includes('isOpen,') ? 'isOpen' : 'visible';
        let close_func_name = content.includes('setIsOpen') ? 'setIsOpen(false)' : 'onClose()';

        // we will only invoke this later if it is true modal
        content = content.replace(/(const \w+\s*:\s*FC<[^>]+>\s*=\s*\([^)]+\)\s*=>\s*\{\n(.+)\n)/,
            `$1\tconst slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current\n\n\tconst closeSheet = (cb?: () => void) => {\n\t\tAnimated.timing(slideAnim, {\n\t\t\ttoValue: SCREEN_HEIGHT,\n\t\t\tduration: 200,\n\t\t\tuseNativeDriver: true\n\t\t}).start(() => {\n\t\t\t${close_func_name};\n\t\t\tcb?.();\n\t\t})\n\t}\n\n\tuseEffect(() => {\n\t\tif (${visible_prop}) {\n\t\t\tAnimated.spring(slideAnim, {\n\t\t\t\ttoValue: 0,\n\t\t\t\tuseNativeDriver: true,\n\t\t\t\ttension: 65,\n\t\t\t\tfriction: 11\n\t\t\t}).start()\n\t\t}\n\t}, [${visible_prop}])\n`);

        // replace closing occurrences
        if (close_func_name === 'setIsOpen(false)') {
            content = content.replace(/setIsOpen\(false\)/g, "closeSheet()");
            content = content.replace(/setIsOpen\(false\);/g, "closeSheet();");
            content = content.replace("closeSheet()", "setIsOpen(false)"); // fix the one inside closeSheet
            content = content.replace("closeSheet();", "setIsOpen(false);");
        } else {
            content = content.replace(/onClose\(\)/g, "closeSheet()");
            content = content.replace(/onClose\(false\)/g, "closeSheet()");
            content = content.replace("closeSheet()", "onClose()"); // fix the one inside closeSheet
            content = content.replace("closeSheet();", "onClose();");
        }
    }

    // Overlays
    content = content.replace(
        /<View[\s\S]*?className='flex-1 justify-end'[\s\S]*?style=\{\{[\s\S]*?backgroundColor: colors\.overlay,[\s\S]*?paddingBottom: containerPaddingBottom[\s\S]*?\}\}[\s\S]*?>[\s\S]*?<View/,
        `<View className='flex-1 justify-end' style={{ paddingBottom: containerPaddingBottom }}>\n\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={closeSheet} />\n\t\t\t\t<Animated.View style={{ transform: [{ translateY: slideAnim }] }}`
    );

    content = content.replace(
        /<View[\s\S]*?className='flex-1 justify-center'[\s\S]*?style=\{\{[\s\S]*?backgroundColor: colors\.overlay[\s\S]*?\}\}[\s\S]*?>[\s\S]*?<View/,
        `<View className='flex-1 justify-center'>\n\t\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={closeSheet} />\n\t\t\t\t\t<Animated.View style={{ transform: [{ translateY: slideAnim }] }}`
    );

    content = content.replace(
        /<Pressable[\s\S]*?className='flex-1 justify-end'[\s\S]*?style=\{\{ backgroundColor: 'rgba\\(0,0,0,0\.5\\)' \}\}[\s\S]*?onPress=\{onClose\}[\s\S]*?>[\s\S]*?<Pressable/,
        `<View className='flex-1 justify-end'>\n\t\t\t\t<Pressable className='flex-1' style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={closeSheet} />\n\t\t\t\t<Animated.View style={{ transform: [{ translateY: slideAnim }] }}`
    );
    
    // Close Animated.View tags
    if (content.includes('<Animated.View')) {
        content = content.replace(/<\/View>(\s*)<\/View>(\s*)<\/AppModal>/, "<\/Animated.View>$1<\/View>$2<\/AppModal>");
        content = content.replace(/<\/Pressable>(\s*)<\/Pressable>(\s*)<\/AppModal>/, "<\/Animated.View>$1<\/View>$2<\/AppModal>");
    }

    fs.writeFileSync(path, content, 'utf8');
});

console.log("Completed JS Patch");
