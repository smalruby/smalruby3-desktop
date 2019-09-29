import {ipcRenderer, shell} from 'electron';
import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';
import GUI, {AppStateHOC, TitledHOC} from 'smalruby3-gui';

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
                'handleStorageInit'
            ]);
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
            this.props.onUpdateProjectTitle(args.title);
        }
        handleStorageInit (storageInstance) {
            storageInstance.addHelper(new ElectronStorageHelper(storageInstance));
        }
        render () {
            return (<WrappedComponent
                isScratchDesktop
                projectId={defaultProjectId}
                onClickLogo={this.handleClickLogo}
                onStorageInit={this.handleStorageInit}
                {...this.props}
            />);
        }
    }

    ScratchDesktopComponent.propTypes = {
        onUpdateProjectTitle: PropTypes.func
    };

    return ScratchDesktopComponent;
};

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = compose(
    AppStateHOC,
    TitledHOC,
    ScratchDesktopHOC // must come after `TitledHOC` so it has access to `onUpdateProjectTitle`
)(GUI);

ReactDOM.render(<WrappedGui />, appTarget);
