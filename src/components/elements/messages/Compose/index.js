import React from 'react';
import tt from 'counterpart';
import { Picker } from 'emoji-picker-element';

import { Button } from 'semantic-ui-react';

import './Compose.css';

export default class Compose extends React.Component {
    onSendMessage = (e) => {
        if (e.keyCode === 13) {
            if (e.shiftKey) {
            } else {
                e.preventDefault();
                const { onSendMessage } = this.props;
                onSendMessage(e.target.value, e);
            }
        }
    };

    init = () => {
        this._tooltip = document.querySelector('.msgs-emoji-picker-tooltip');
        if (!this._tooltip)
            return;

        if (this._tooltip.childNodes.length)
            return;

        this._picker = new Picker({
            locale: tt.getLocale(),
            i18n: tt('emoji_i18n'),
        });

        this._picker.addEventListener('emoji-click', this.onEmojiSelect);

        this._tooltip.appendChild(this._picker);

        setTimeout(() => {
            const button = document.querySelector('.msgs-emoji-picker-opener');
            if (button) {
                button.addEventListener('click', this.onEmojiClick);
                document.body.addEventListener('click', this.onBodyClick);
            }
        }, 500);
    };

    componentDidMount() {
        this.init();
    }

    componentDidUpdate() {
        this.init();
    }

    onEmojiClick = (event) => {
        event.stopPropagation();
        this._tooltip.classList.toggle('shown');
        if (!this._tooltip.classList.contains('shown')) {
            const input = document.getElementsByClassName('msgs-compose-input')[0];
            if (input) {
                input.focus();
            }
        }
    };

    onBodyClick = (event) => {
        if (!this._tooltip) return;
        if (event.target.tagName.toLowerCase() === 'emoji-picker') return;
        this._tooltip.classList.remove('shown');
    };

    insertAtCursor(myField, myValue) {
        //IE support
        if (document.selection) {
            myField.focus();
            let sel = document.selection.createRange();
            sel.text = myValue;
        }
        //MOZILLA and others
        else if (myField.selectionStart || myField.selectionStart === '0') {
            let startPos = myField.selectionStart;
            let endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                + myValue
                + myField.value.substring(endPos, myField.value.length);
        } else {
            myField.value += myValue;
        }
    }

    onEmojiSelect = (event) => {
        this._tooltip.classList.toggle('shown');

        const input = document.getElementsByClassName('msgs-compose-input')[0];
        if (input) {
            input.focus();
            this.insertAtCursor(input, ' ' + event.detail.unicode + ' ');
        }
    };

    onPanelDeleteClick = (event) => {
        if (this.props.onPanelDeleteClick) {
            this.props.onPanelDeleteClick(event);
        }
    }

    onPanelEditClick = (event) => {
        if (this.props.onPanelEditClick) {
            this.props.onPanelEditClick(event);
        }
    }

    onPanelCloseClick = (event) => {
        if (this.props.onPanelCloseClick) {
            this.props.onPanelCloseClick(event);
        }
    }

    render() {
        const { account, rightItems } = this.props;
        const { onPanelDeleteClick, onPanelEditClick, onPanelCloseClick } = this;

        const selectedMessages = Object.entries(this.props.selectedMessages);
        let selectedMessagesCount = 0;
        let selectedEditablesCount = 0;
        for (let [, info] of selectedMessages) {
            selectedMessagesCount++;
            if (info.editable) {
                selectedEditablesCount++;
            }
        }

        return (
            <div className='msgs-compose'>
                {
                    !selectedMessagesCount ? rightItems : null
                }
                {!selectedMessagesCount ? (<textarea
                    className='msgs-compose-input'
                    placeholder={tt('messages.type_a_message_NAME', {NAME: account.name})}
                    onKeyDown={this.onSendMessage}
                />) : null}
                {selectedMessagesCount ? (<div className='msgs-compose-panel'>
                    <Button
                        icon='remove'
                        inverted
                        color='red'
                        content={tt('g.remove')}
                        onClick={onPanelDeleteClick} />
                    {(selectedMessagesCount === 1 && selectedEditablesCount === 1) ? (<Button
                        icon='pencil'
                        inverted
                        color='blue'
                        content={tt('g.edit')}
                        onClick={onPanelEditClick} />) : null}
                    <Button
                        color='blue'
                        inverted
                        icon='triangle left'
                        className='cancel-button' onClick={onPanelCloseClick}>{tt('g.cancel')}</Button>
                </div>) : null}
            </div>
        );
    }
}
