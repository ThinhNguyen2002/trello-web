import { isEmpty } from 'lodash'
import { Container, Draggable } from 'react-smooth-dnd'
import {
    Container as BootstrapContainer,
    Row,
    Col,
    Form,
    Button,
} from 'react-bootstrap'
import { useState, useEffect, useRef } from 'react'

import './BoardContent.scss'

import Column from 'components/Column/Column'

import { mapOrder } from 'utilities/sorts'
import { applyDrag } from 'utilities/dragDrop'

import { fetchBoardDetails } from 'actions/ApiCall'

function BoardContent() {
    const [board, setBoard] = useState({})
    const [columns, setColumns] = useState([])
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false)

    const newColumnInputRef = useRef(null)

    const [newColumnTitle, setNewColumnTitle] = useState('')
    const onNewColumnTitleChange = e => {
        setNewColumnTitle(e.target.value)
    }

    useEffect(() => {
        const boardId = '6208842f62fbebc37607b005'
        fetchBoardDetails(boardId).then(board => {
            setBoard(board)
            setColumns(mapOrder(board.columns, board.columnOrder, '_id'))
        })
    }, [])

    useEffect(() => {
        if (newColumnInputRef && newColumnInputRef.current) {
            newColumnInputRef.current.focus()
            newColumnInputRef.current.select()
        }
    }, [openNewColumnForm])

    const onColumnDrop = dropResult => {
        let newColumn = [...columns]
        newColumn = applyDrag(newColumn, dropResult)

        let newBoard = { ...board }
        newBoard.columnOder = newColumn.map(column => column.id)
        newBoard.columns = newColumn

        setBoard(newBoard)
        setColumns(newColumn)
    }

    const onCardDrop = (columnId, dropResult) => {
        if (
            dropResult.removedIndex !== null ||
            dropResult.addedIndex !== null
        ) {
            let newColumn = [...columns]

            let currentColumn = newColumn.find(c => c.id === columnId)
            currentColumn.cards = applyDrag(currentColumn.cards, dropResult)

            currentColumn.cardOder = currentColumn.cards.map(
                column => column.id
            )

            setColumns(newColumn)
        }
    }

    const toggleOpenNewColumnForm = () => {
        setOpenNewColumnForm(!openNewColumnForm)
    }

    const addNewColumn = () => {
        if (!newColumnTitle) {
            newColumnInputRef.current.focus()
            return
        }
        const newColumnToAdd = {
            id: Math.random().toString(36).substring(2, 5),
            boardId: board.id,
            title: newColumnTitle,
            cardOder: [],
            cards: [],
        }

        let newColumn = [...columns]
        newColumn.push(newColumnToAdd)

        let newBoard = { ...board }
        newBoard.columnOder = newColumn.map(column => column.id)
        newBoard.columns = newColumn

        setNewColumnTitle('')
        setBoard(newBoard)
        setColumns(newColumn)
        toggleOpenNewColumnForm()
    }

    const onUpdateColumn = newColumnToUpdate => {
        let columnIdToUpdate = newColumnToUpdate.id
        let newColumn = [...columns]

        const columnIndexToUpdate = newColumn.findIndex(
            i => i.id === columnIdToUpdate
        )
        if (newColumnToUpdate._destroy) {
            newColumn.splice(columnIndexToUpdate, 1)
        } else {
            newColumn.splice(columnIndexToUpdate, 1, newColumnToUpdate)
        }

        let newBoard = { ...board }
        newBoard.columnOder = newColumn.map(column => column.id)
        newBoard.columns = newColumn

        setBoard(newBoard)
        setColumns(newColumn)
    }

    if (isEmpty(board)) {
        return <div className="not-found">Board not found</div>
    }

    return (
        <div className="board-content">
            <Container
                orientation="horizontal"
                onDrop={onColumnDrop}
                dragHandleSelector=".column-drag-handle"
                dropPlaceholder={{
                    animationDuration: 150,
                    showOnTop: true,
                    className: 'column-drop-preview',
                }}
                getChildPayload={index => columns[index]}
            >
                {columns.map((column, index) => (
                    <Draggable key={index}>
                        <Column
                            column={column}
                            onCardDrop={onCardDrop}
                            onUpdateColumn={onUpdateColumn}
                        />
                    </Draggable>
                ))}
            </Container>

            <BootstrapContainer className="trello-clone-container">
                {!openNewColumnForm && (
                    <Row>
                        <Col
                            className="add-new-column"
                            onClick={toggleOpenNewColumnForm}
                        >
                            <i className="fa fa-plus icon" />
                            Add another column
                        </Col>
                    </Row>
                )}
                {openNewColumnForm && (
                    <Row>
                        <Col className="enter-new-column">
                            <Form.Control
                                size="sm"
                                type="text"
                                placeholder="Enter column title..."
                                className="input-enter-new-column"
                                ref={newColumnInputRef}
                                value={newColumnTitle}
                                onChange={onNewColumnTitleChange}
                                onKeyDown={event =>
                                    event.key === 'Enter' && addNewColumn()
                                }
                            />
                            <Button
                                variant="success"
                                size="sm"
                                onClick={addNewColumn}
                            >
                                Add column
                            </Button>
                            <span
                                className="cancle-icon"
                                onClick={toggleOpenNewColumnForm}
                            >
                                <i className="fa fa-trash icon" />
                            </span>
                        </Col>
                    </Row>
                )}
            </BootstrapContainer>
        </div>
    )
}

export default BoardContent
