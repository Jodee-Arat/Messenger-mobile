import { FC } from 'react'
import { ScrollView } from 'react-native'

import { SendFileType } from '@/types/send-file.type'

import FileItem from './FileItem'

interface FileListProp {
	files: SendFileType[]
	filesEdited: SendFileType[]
	onDeleteFile: (id: string) => void
	isLoadingSend: boolean
}

const FileList: FC<FileListProp> = ({
	files,
	filesEdited,
	onDeleteFile,
	isLoadingSend
}) => {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{
				gap: 8,
				paddingHorizontal: 4,
				paddingVertical: 4
			}}
		>
			{files.map((file, index) => (
				<FileItem
					key={index}
					file={file}
					onDeleteFile={() => {
						onDeleteFile(file.id!)
					}}
					isLoadingSend={isLoadingSend && files.length - 1 === index}
				/>
			))}
		</ScrollView>
	)
}

export default FileList
