import { CompactTable } from '@table-library/react-table-library/compact';



const columns = [
	{ label: 'Names', renderCell: (item) => item.name },
];

const Component = ({ nodes }) => {
	const data = { nodes };

	return <CompactTable columns={columns} data={data} />;
};

export default Component
