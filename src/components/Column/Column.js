import './Column.scss'
import { Dropdown, Form, Button } from 'react-bootstrap'
import { Container, Draggable } from 'react-smooth-dnd'
import { mapOrder } from 'utilities/sorts'
import { cloneDeep } from 'lodash'
import {
    selectAllInlineText,
    saveContentAfterPressEnter,
} from 'utilities/contentEditable'
import { useState, useEffect, useRef } from 'react'
import ConfirmModal from 'components/Common/ConfirmModal'
import Card from 'components/Card/Card'
import { MODAL_ACTION_CONFIRM } from 'utilities/constants'
import { createCard, updateCoulumn } from 'actions/ApiCall'

function Column(props) {
    const { column, onCardDrop, onUpdateColumnState } = props
    const cards = mapOrder(column.cards, column.cardOrder, '_id')

    const newCardAreaRef = useRef(null)

    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [columnTitle, setColumnTitle] = useState('')
    const [opentNewCardForm, setOpentNewCardForm] = useState(false)
    const [newCardContent, setNewCardContent] = useState('')

    const handleTitleColumnChange = e => {
        setColumnTitle(e.target.value)
    }

    //Update column title
    const handleTitleColumnBlur = () => {
        if (column.title !== columnTitle) {
            let newColumn = {
                ...column,
                title: columnTitle,
            }
            updateCoulumn(newColumn._id, newColumn).then(updatedColumn => {
                updatedColumn.cards = newColumn.cards
                onUpdateColumnState(updatedColumn)
            })
        }
    }

    useEffect(() => {
        setColumnTitle(column.title)
    }, [column.title])

    const toggleShowConfrimModal = () => setShowConfirmModal(!showConfirmModal)

    //Remove column
    const onConfirmModalAction = (type, idColumn) => {
        if (type === MODAL_ACTION_CONFIRM) {
            let newColumn = {
                ...column,
                _destroy: true,
            }
            updateCoulumn(newColumn._id, newColumn).then(updatedColumn => {
                onUpdateColumnState(updatedColumn)
            }) 
        }
        toggleShowConfrimModal()
    }

    //handle new card
    useEffect(() => {
        if (newCardAreaRef && newCardAreaRef.current) {
            newCardAreaRef.current.focus()
            newCardAreaRef.current.select()
        }
    }, [opentNewCardForm])

    const toggleOpentNewCardForm = () => {
        setOpentNewCardForm(!opentNewCardForm)
    }
    const onNewCardContentChange = e => {
        setNewCardContent(e.target.value)
    }
    const handleAddNewCard = () => {
        if (!newCardContent) {
            newCardAreaRef.current.focus()
            return
        }
        let newCardToAdd = {
            boardId: column.boardId,
            columnId: column._id,
            title: newCardContent.trim(),
        }

        //Call API
        createCard(newCardToAdd).then(card => {
            let newColumn = cloneDeep(column)

            newColumn.cards.push(card)
            newColumn.cardOrder.push(card._id)

            onUpdateColumnState(newColumn)
            setNewCardContent('')
            toggleOpentNewCardForm()
        })
    }

    return (
        <div className="column">
            <header className="column-drag-handle">
                <div className="column-title">
                    <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Enter column title..."
                        className="trello-content-editable"
                        value={columnTitle}
                        onClick={selectAllInlineText}
                        onChange={handleTitleColumnChange}
                        onBlur={handleTitleColumnBlur}
                        onKeyDown={saveContentAfterPressEnter}
                        onMouseDown={e => {
                            e.preventDefault()
                        }}
                        spellCheck="false"
                    />
                </div>
                <div className="column-dropdow-actions">
                    <Dropdown>
                        <Dropdown.Toggle
                            id="dropdown-basic"
                            size="sm"
                            className="dropdown-btn"
                        />

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={toggleOpentNewCardForm}>
                                Add card...
                            </Dropdown.Item>
                            <Dropdown.Item onClick={toggleShowConfrimModal}>
                                Remove column...
                            </Dropdown.Item>
                            <Dropdown.Item>
                                Move all cards in this column (beta)...
                            </Dropdown.Item>
                            <Dropdown.Item>
                                Archive all cards in this column (beta)...
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </header>
            <div className="card-list">
                <Container
                    groupName="col"
                    orientation="vertical"
                    onDrop={dropResult => onCardDrop(column._id, dropResult)}
                    getChildPayload={index => cards[index]}
                    dragClass="card-ghost"
                    dropClass="card-ghost-drop"
                    dropPlaceholder={{
                        animationDuration: 150,
                        showOnTop: true,
                        className: 'card-drop-preview',
                    }}
                    dropPlaceholderAnimationDuration={200}
                >
                    {cards.map((card, index) => (
                        <Draggable key={index}>
                            <Card card={card} />
                        </Draggable>
                    ))}
                </Container>
                {opentNewCardForm && (
                    <div className="add-new-card-area">
                        <Form.Control
                            size="sm"
                            as="textarea"
                            rows="3"
                            placeholder="Enter a title for this card..."
                            className="area-enter-new-card"
                            ref={newCardAreaRef}
                            value={newCardContent}
                            onChange={onNewCardContentChange}
                            onKeyDown={event =>
                                event.key === 'Enter' && handleAddNewCard()
                            }
                        />
                    </div>
                )}
            </div>

            <footer>
                {opentNewCardForm && (
                    <div className="add-new-card-actions">
                        <Button
                            variant="success"
                            size="sm"
                            onClick={handleAddNewCard}
                        >
                            Add card
                        </Button>
                        <span
                            className="cancle-icon"
                            onClick={toggleOpentNewCardForm}
                        >
                            <i className="fa fa-trash icon" />
                        </span>
                    </div>
                )}
                {!opentNewCardForm && (
                    <div
                        className="footer-actions"
                        onClick={toggleOpentNewCardForm}
                    >
                        <span>
                            <i className="fa fa-plus icon" />
                            Add another card
                        </span>
                    </div>
                )}
            </footer>

            <ConfirmModal
                show={showConfirmModal}
                onAction={onConfirmModalAction}
                title={'Remove colum'}
                content={`Are you sure you want to remove <strong> ${column.title}</strong> 
                <br />All realated cards also be removed! `}
                idColumn={column._id}
            />
        </div>
    )
}

export default Column
