import { List } from 'semantic-ui-react'

export default function Item({ url, onClick, children }) {
	return (
		<List.Item className='Anchor' onClick={() => onClick(url)}>
			{children}
		</List.Item>
	);
}
