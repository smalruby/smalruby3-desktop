import {ipcRenderer, shell} from 'electron';
import bindAll from 'lodash.bindall';
import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';
import GUI, {AppStateHOC} from 'smalruby3-gui';

import ElectronStorageHelper from '../common/ElectronStorageHelper';

import styles from './app.css';

const defaultProjectId = 0;

// override window.open so that it uses the OS's default browser, not an electron browser
window.open = function (url, target) {
    if (target === '_blank') {
        shell.openExternal(url);
    }
};
// Register "base" page view
// analytics.pageview('/');

const appTarget = document.getElementById('app');
appTarget.className = styles.app || 'app'; // TODO
document.body.appendChild(appTarget);

GUI.setAppElement(appTarget);

const ScratchDesktopHOC = function (WrappedComponent) {
    class ScratchDesktopComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleSetTitleFromSave',
                'handleStorageInit',
                'handleUpdateProjectTitle'
            ]);
            this.state = {
                projectTitle: null
            };
        }
        componentDidMount () {
            ipcRenderer.on('setTitleFromSave', this.handleSetTitleFromSave);
        }
        componentWillUnmount () {
            ipcRenderer.removeListener('setTitleFromSave', this.handleSetTitleFromSave);
        }
        handleClickLogo () {
            ipcRenderer.send('open-about-window');
        }
        handleSetTitleFromSave (event, args) {
            this.handleUpdateProjectTitle(args.title);
        }
        handleStorageInit (storageInstance) {
            storageInstance.addHelper(new ElectronStorageHelper(storageInstance));
        }
        handleUpdateProjectTitle (newTitle) {
            this.setState({projectTitle: newTitle});
        }
        render () {
            return (<WrappedComponent
                canEditTitle
                isScratchDesktop
                projectId={defaultProjectId}
                projectTitle={this.state.projectTitle}
                onClickLogo={this.handleClickLogo}
                onStorageInit={this.handleStorageInit}
                onUpdateProjectTitle={this.handleUpdateProjectTitle}
                {...this.props}
            />);
        }
    }

    return ScratchDesktopComponent;
};

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = compose(
    ScratchDesktopHOC,
    AppStateHOC
)(GUI);

ReactDOM.render(<WrappedGui />, appTarget);
