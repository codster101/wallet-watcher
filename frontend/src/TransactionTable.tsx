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
			type={type}
			value={cellValue}
			onChange={(event) => { updateValue(event.target.value) }}
			onBlur={() => { updateDB() }}
			onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
		/>
	);
}

function DeleteCheckboxCell({ id, deleteSet }: { id: number, deleteSet: Set<Identifier> }) {

	// Return in-edit element
	return (
		<input
			// style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}
			type="checkbox"
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
	if (nodes == null) nodes = [];

	const [month, setMonth] = useState((new Date()).getMonth())
	const months = [
		"January", "February", "March", "April",
		"May", "June", "July", "August",
		"September", "October", "November", "December"
	];

	const deleteSet = new Set<Identifier>();

	// const theme = useTheme(getTheme());

	const theme = useTheme([
		getTheme(),
		{
			Table: `
				--data-table-library_grid-template-columns: 36px 2fr 1fr 1.4fr 1.2fr;
				font-family: 'DM Mono', monospace;
				font-size: 0.8rem;
				width: 100%;
				border: none;
				background: transparent;
			      `,
			HeaderRow: `background: #fafafa; border-bottom: 1px solid #e8e8ee;`,
			HeaderCell: `
				font-family: 'DM Mono', monospace;
				font-size: 0.62rem;
				letter-spacing: 0.08rem;
				text-transform: uppercase;
				color: #6b6b7a;
				font-weight: 400;
				padding: 0.55rem 0.75rem;
				background: #fafafa;
				border-bottom: 1px solid #e8e8ee;
			      `,
			Row: `
				border-bottom: 1px solid #f0f0f5;
				&:last-child { border-bottom: none; }
				&:hover > * { background: #fafafa; }
			      `,
			Cell: `
				padding: 0.5rem 0.75rem;
				color: #374151;
				background: #fff;
				input[type="checkbox"] {
				  accent-color: #7dd3d8;
				  width: 14px;
				  height: 14px;
				  cursor: pointer;
				}
				input[type="text"],
				input[type="number"],
				input[type="date"] {
				  width: 100%;
				  background: transparent;
				  border: 1px solid transparent;
				  border-radius: 4px;
				  color: #1a1a1a;
				  font-family: 'DM Mono', monospace;
				  font-size: 0.8rem;
				  padding: 0.15rem 0.3rem;
				  outline: none;
				  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
				}
				input[type="text"]:hover,
				input[type="number"]:hover,
				input[type="date"]:hover { border-color: #e2e2ea; }
				input[type="text"]:focus,
				input[type="number"]:focus,
				input[type="date"]:focus {
				  border-color: #7dd3d8;
				  background: #f5f5f7;
				  box-shadow: 0 0 0 2px rgba(125,211,216,0.1);
				}
			      `,
		}
	]);

	const sort = useSort({ nodes }, {}, {
		sortFns: {
			NAME: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
			AMOUNT: (array) => array.sort((a, b) => a.amount - b.amount),
			CATEGORY: (array) => array.sort((a, b) => a.category.localeCompare(b.category)),
			DATE: (array) => array.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		}
	});

	nodes = nodes.filter((t) => (new Date(t.date)).getMonth() == month ? true : false);

	return (
		<div className='table-panel'>
			<div className="table-controls">
				<span className='sec-label' style={{ margin: 0 }}>Transactions</span>
				<select className="month-select" style={{ marginLeft: 'auto' }} defaultValue={month} onChange={(event) => {
					setMonth(Number.parseInt(event.target.value));
				}}>
					{months.map((month, i) => (
						<option key={i} value={i}>{month}</option>
					))}:
				</select>
				<button className='btn-delete-transaction' onClick={() => { handleDelete(deleteSet) }}>Delete Selected</button>
			</div>

			<Table data={{ nodes }} theme={theme} sort={sort} >
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
		</div>
	);
};

