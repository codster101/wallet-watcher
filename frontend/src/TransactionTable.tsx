import { CompactTable } from '@table-library/react-table-library/compact';
import { type Transaction } from './Transaction.tsx'

const COLUMNS = [
	{ label: 'Names', renderCell: (item: Transaction) => item.name },
	{ label: 'Amount', renderCell: (item: Transaction) => item.amount },
	{ label: 'Category', renderCell: (item: Transaction) => item.category },
	{ label: 'Date', renderCell: (item: Transaction) => item.date },
];

export function TransactionTable({ nodes }: { nodes: Transaction[] }) {
	const data = { nodes };

	return <CompactTable columns={COLUMNS} data={data} />;
};

