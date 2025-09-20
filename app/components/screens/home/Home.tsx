import { FC } from 'react'

import Layout from '@/components/layout/Layout'

import { useTypedNavigation } from '@/hooks/useTypedNavigation'

import Header from './Header'

// import Banner from './banner/Banner'
// import Categories from './categories/Categories'
// import Products from './products/Products'

const Home: FC = () => {
	return (
		<Layout className='flex-1'>
			<Header />
			{/* <Banner />
			<Categories />
			<Products /> */}
		</Layout>
	)
}

export default Home
