import { CompactTable } from '@table-library/react-table-library/compact';

export type Transaction = {
	name: string;
	amount: number;
	category: string;
	date: string;
}

// const nodes = [
// 	{
// 		name: 'Cody',
// 	},
// 	{
// 		name: 'Kenzie',
// 	},
// 	{
// 		name: 'Waffle',
// 	},
// 	{
// 		name: 'Wally',
// 	},
// ];
//
const COLUMNS = [
	{ label: 'Names', renderCell: (item: Transaction) => item.name },
	{ label: 'Amount', renderCell: (item: Transaction) => item.amount },
	{ label: 'Category', renderCell: (item: Transaction) => item.category },
	{ label: 'Date', renderCell: (item: Transaction) => item.date },
];

export const TransactionTable = ({ nodes }: { nodes: Transaction[] }) => {
	const data = { nodes };

	return <CompactTable columns={COLUMNS} data={data} />;
};

