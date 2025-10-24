import { FC } from 'react'
import { View } from 'react-native'

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
		<View className='flex gap-x-4 overflow-x-auto'>
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
		</View>
	)
}

export default FileList
