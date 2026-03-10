import { CompactTable } from '@table-library/react-table-library/compact';

const nodes = [
	{
		name: 'Shopping List',
	},
	{
		name: 'Shopping List',
	},
	{
		name: 'Shopping List',
	},
];

const COLUMNS = [
	{ label: 'Task', renderCell: (item) => item.name },
];

const Component = () => {
	const data = { nodes };

	return <CompactTable columns={COLUMNS} data={data} />;
};
