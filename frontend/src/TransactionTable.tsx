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
import { useState } from 'react';

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
	handleUpdate: (value: string, id: Identifier, property: string) => {}
	handleDelete: (deleteSet: Set<Identifier>) => {}
}

export function TransactionTable({ nodes, handleUpdate, handleDelete }: Props) {

	const [month, setMonth] = useState((new Date()).getMonth())
	const months = [
		"January", "February", "March", "April",
		"May", "June", "July", "August",
		"September", "October", "November", "December"
	];

	const deleteSet = new Set<Identifier>();

	const theme = useTheme(getTheme());

	const sort = useSort({ nodes }, {}, {
		sortFns: {
			NAME: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
			AMOUNT: (array) => array.sort((a, b) => a.amount - b.amount),
			CATEGORY: (array) => array.sort((a, b) => a.category.localeCompare(b.category)),
			DATE: (array) => array.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		}
	});

	nodes = nodes.filter((t) => (new Date(t.date)).getMonth() == month ? true : false);
	console.log(nodes);


	return (
		<>
			<select defaultValue={month} onChange={(event) => {
				setMonth(Number.parseInt(event.target.value));
			}}>
				{months.map((month, i) => (
					<option key={i} value={i}>{month}</option>
				))}:
			</select>
			<button onClick={() => { handleDelete(deleteSet) }}>Delete</button>
			<Table data={{ nodes }} theme={theme} sort={sort} style={{ height: "500px" }}>
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
											handleUpdate={handleUpdate}
										/>
									</Cell>
									<Cell>
										<EditableCell
											type="number"
											value={item.amount.toString()}
											id={item.id}
											property='amount'
											handleUpdate={handleUpdate}
										/>
									</Cell>
									<Cell>
										<EditableCell
											type="text"
											value={item.category}
											id={item.id}
											property='category'
											handleUpdate={handleUpdate}
										/>
									</Cell>
									<Cell>
										<EditableCell
											type="date"
											value={item.date}
											id={item.id}
											property='date'
											handleUpdate={handleUpdate}
										/>
									</Cell>
								</Row>
							))}
						</Body>
					</>
				)}
			</Table>
		</>
	);
};

