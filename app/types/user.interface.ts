import { IProduct } from './product.interface'

export interface IUser {
	id: string
	login: string
	email: string
	password: string
	name: string
	avatarPath: string
	favorites: IProduct[]
}
