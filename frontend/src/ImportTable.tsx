import { type Transaction } from './Transaction.tsx'
import {
	Table,
	Header,
	HeaderRow,
	Body,
	Row,
	Cell,
	type TableNode,
	type Identifier,
} from '@table-library/react-table-library/table';
import {
	useSort,
	HeaderCellSort,
} from "@table-library/react-table-library/sort";
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { useEffect, useState } from 'react';

function EditableCell({ type, value, id, property, handleUpdate }:
	{ type: string, value: string, id: Identifier, property: string, handleUpdate: (value: string, id: Identifier, property: string) => void }) {
	// Value state
	const [cellValue, updateValue] = useState(value);

	// Update DB
	const updateDB = () => {
		handleUpdate(cellValue, id, property);
	}

	// Return in-edit element
	return (
		<input
			style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}
			type={type}
			value={cellValue}
			onChange={(event) => { updateValue(event.target.value) }}
			onBlur={() => { updateDB() }}
			onKeyDown={(event) => {
				if (event.key === 'Enter') {
					updateDB();
					event.currentTarget.blur();
				}
			}}
		/>
	);
}

function DeleteCheckboxCell({ type, id, deleteSet }: { type: string, id: number, deleteSet: Set<Identifier> }) {

	// Return in-edit element
	return (
		<input
			style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}
			type={type}
			onChange={(event) => { event.target.checked ? deleteSet.add(id) : deleteSet.delete(id) }}
		/>
	);
}

interface Props {
	nodes: Transaction[],
	submitTransactions: (newTransactions: Transaction[]) => void
}

export default function ImportTable({ nodes, submitTransactions }: Props) {
	// console.log(nodes);
	const [transactions, updateTransactions] = useState<Transaction[]>([])
	const deleteSet = new Set<Identifier>();
	// console.log("Reset Set");

	useEffect(() => updateTransactions(nodes), [nodes])

	const theme = useTheme(getTheme());

	const rows = Array.from(transactions.values());
	console.log(rows);
	// console.log(transactions);

	const sort = useSort({ nodes: rows }, {}, {
		sortFns: {
			NAME: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
			AMOUNT: (array) => array.sort((a, b) => a.amount - b.amount),
			CATEGORY: (array) => array.sort((a, b) => a.category.localeCompare(b.category)),
			DATE: (array) => array.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		}
	});

	function handleDelete(idsToDelete: Set<Identifier>) {
		// newTransactions = transactions.filter((transaction) => transaction.id
		let newTransactions = transactions.filter((t) => !idsToDelete.has(t.id));
		updateTransactions(newTransactions);
	}

	function updateTransactionValue(value: string, id: Identifier, property: string) {
		let newTransactions = transactions.map((t) => t.id == id ? { ...t, [property]: value } : t);
		updateTransactions(newTransactions);
	}

	return (
		<>
			<button onClick={() => { handleDelete(deleteSet) }}>Delete</button>
			<Table data={{ nodes: rows }} theme={theme} sort={sort}>
				{(tableList: TableNode) => (
					<>
						<Header>
							<HeaderRow>
								<HeaderCellSort sortKey='DELETE'></HeaderCellSort>
								<HeaderCellSort sortKey='NAME'>Name</HeaderCellSort>
								<HeaderCellSort sortKey='AMOUNT'>Amount</HeaderCellSort>
								<HeaderCellSort sortKey='CATEGORY'>Category</HeaderCellSort>
								<HeaderCellSort sortKey='DATE'>Date</HeaderCellSort>
							</HeaderRow>
						</Header>

						<Body>
							{tableList.map((item: Transaction) => (
								<Row key={item.id} item={item}>
									<Cell>
										<DeleteCheckboxCell
											type="checkbox"
											id={item.id}
											deleteSet={deleteSet}
										/>
									</Cell>
									<Cell>
										<EditableCell
											type="text"
											value={item.name}
											id={item.id}
											property='name'
											handleUpdate={updateTransactionValue}
										/>
									</Cell>
									<Cell>
										<EditableCell
											type="number"
											value={item.amount.toString()}
											id={item.id}
											property='amount'
											handleUpdate={updateTransactionValue}
										/>
									</Cell>
									<Cell>
										<EditableCell
											type="text"
											value={item.category}
											id={item.id}
											property='category'
											handleUpdate={updateTransactionValue}
										/>
									</Cell>
									<Cell>
										<EditableCell
											type="date"
											value={item.date}
											id={item.id}
											property='date'
											handleUpdate={updateTransactionValue}
										/>
									</Cell>
								</Row>
							))}
						</Body>
					</>
				)}
			</Table>
			<button onClick={() => { submitTransactions([...transactions.values()]) }}>Submit</button>
		</>
	);
};

