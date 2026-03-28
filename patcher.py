import os
import re

files = [
    r'd:\ararat\vs\messenger\apps\mobile\app\components\screens\chats-list\CreateChatModal.tsx',
    r'd:\ararat\vs\messenger\apps\mobile\app\components\screens\home\groups\CreateGroupModal.tsx',
    r'd:\ararat\vs\messenger\apps\mobile\app\components\screens\chat\message\default\list\ForwardMessageModal.tsx',
    r'd:\ararat\vs\messenger\apps\mobile\app\components\screens\chat\message\secret\list\ForwardMessageModal.tsx',
    r'd:\ararat\vs\messenger\apps\mobile\app\components\screens\chat\FingerprintVerificationModal.tsx'
]

# Ensure animated and dimensions imports exist
def ensure_imports(content):
    if 'Animated' not in content and 'Dimensions' not in content:
        content = content.replace("import {", "import { Animated, Dimensions,", 1)
    else:
        if 'Animated' not in content:
             content = content.replace("Dimensions", "Animated, Dimensions", 1)
        if 'Dimensions' not in content:
             content = content.replace("Animated", "Animated, Dimensions", 1)
             
    # ensure Pressable is imported
    if 'Pressable' not in content:
        content = content.replace("import {", "import { Pressable,", 1)
    return content

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Animation type none
    content = content.replace("animationType='slide'", "animationType='none'")
    
    content = ensure_imports(content)
    
    # 2. Add SCREEN_HEIGHT constant if not exists
    if 'const SCREEN_HEIGHT' not in content:
        # put it before the component declaration
        content = re.sub(r'(const \w+\s*:\s*FC<[^>]+>\s*=\s*\([^)]+\)\s*=>\s*\{)',
                         r'const SCREEN_HEIGHT = Dimensions.get("window").height\n\n\1', content)
                         
    # 3. Add slideAnim ref
    if 'slideAnim = useRef' not in content:
        content = re.sub(r'(const \w+\s*:\s*FC<[^>]+>\s*=\s*\([^)]+\)\s*=>\s*\{\n(.+)\n)',
                         r'\1\n\tconst slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current\n', content)
                         
    # 4. Modify useEffect for isOpen/visible and closing sheet logic
    # Find the parameter that signifies visibility (visible or isOpen)
    visible_prop = 'isOpen' if ('isOpen' in content and 'isOpen,' in content) else 'visible'
    
    # For modals, the problem states "When closing- Animated.timing... before onClose()"
    # Instead of patching useEffect which can be complex, let's create a closeSheet function 
    # and replace the calls to onClose / setIsOpen(false) with closeSheet() 
    
    close_func_name = 'setIsOpen(false)' if 'setIsOpen' in content else 'onClose()'
    if 'closeSheet' not in content:
        close_sheet_logic = f"""
    const closeSheet = () => {{
        Animated.timing(slideAnim, {{
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true
        }}).start(() => {{
            {close_func_name}
        }})
    }}
    
    useEffect(() => {{
        if ({visible_prop}) {{
            Animated.spring(slideAnim, {{
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11
            }}).start()
        }}
    }}, [{visible_prop}, slideAnim])
"""
        content = re.sub(r'(const slideAnim = useRef[^;]+current\n)', r'\1' + close_sheet_logic, content)
        
    # Replace closing calls BUT skip occurrences inside closeSheet definition
    # Easiest way is to define it at the end of imports, wait no it must be inside component
    
    # We will replace all occurrences of `setIsOpen(false)` or `onClose()` EXCEPT the one inside closeSheet
    # Wait, simple trick: replace them all with `closeSheet()`, then fix the one inside `closeSheet` back
    content = content.replace(close_func_name, "closeSheet()")
    # Fix the one inside closeSheet
    content = content.replace("""}).start(() => {
            closeSheet()
        })""", f"""}}).start(() => {{
            {close_func_name}
        }})""")

    # 5. Fix Overlay padding and content wrap
    # We need to wrap the sheet content in <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
    # and leave the overlay (Pressable/View with colors.overlay) outside without animation
    # This involves replacing:
    # <View className='flex-1 justify-end' style={{ backgroundColor: colors.overlay ... }}>
    #     <View style={{ ... }}> ...content... </View>
    # </View>
    # With:
    # <View className='flex-1 justify-end'>
    #     <Pressable style={Absolute Fill or flex-1 + backgroundColor colors.overlay} onPress={closeSheet} />
    #     <Animated.View style={{ transform: [{ translateY: slideAnim }] }}> ... </Animated.View>
    # </View>
    
    # It's different for every file. For CreateChatModal.tsx:
    content = content.replace(
"""			<View
				className='flex-1 justify-end'
				style={{
					backgroundColor: colors.overlay,
					paddingBottom: containerPaddingBottom
				}}
			>
				<View""",
"""			<View className='flex-1 justify-end' style={{ paddingBottom: containerPaddingBottom }}>
				<Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={closeSheet} />
				<Animated.View"""
    )
    content = content.replace(
"""			<View
				className='flex-1 justify-end'
				style={{
					backgroundColor: colors.overlay,
					paddingBottom: containerPaddingBottom
				}}
			>
				<View""",
"""			<View className='flex-1 justify-end' style={{ paddingBottom: containerPaddingBottom }}>
				<Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={closeSheet} />
				<Animated.View"""
    )
    
    # For ForwardMessageModal (default & secret):
    content = content.replace(
"""				<View
					className='flex-1 justify-center'
					style={{ backgroundColor: colors.overlay }}
				>
					<View""",
"""				<View className='flex-1 justify-center'>
					<Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.overlay }} onPress={closeSheet} />
					<Animated.View"""
    )
    
    # For FingerprintVerificationModal:
    content = content.replace(
"""			<Pressable
				className='flex-1 justify-end'
				style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
				onPress={onClose}
			>
				<Pressable""",
"""			<View className='flex-1 justify-end'>
				<Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={closeSheet} />
				<Animated.View"""
    )

    # Now we need to close the <Animated.View> where we replaced `<View` or `<Pressable`
    # Basically the inner component ends right before </AppModal>
    if '<Animated.View' in content:
        # replace the last </View> or </Pressable> before </View> (outer) -> </AppModal>
        content = re.sub(r'</View>\s*</View>\s*</AppModal>', '</Animated.View>\n\t\t\t</View>\n\t\t</AppModal>', content)
        content = re.sub(r'</Pressable>\s*</Pressable>\s*</AppModal>', '</Animated.View>\n\t\t\t</View>\n\t\t</AppModal>', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Patch completed')
