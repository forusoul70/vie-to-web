import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import FolderList from './FolderList';
import './FileList.css';
import $ from 'jquery';
import logo from './logo.svg';

function getFileList() {
    return axios.get('/torrent/list')
}

function uploadFile(file) {    
    var data = new FormData()
    data.append('file', file)
    return axios.post('/file', data, null)    
}

function requestByMagent(magnet) {
    var data = {magnet : magnet}
    return axios.post('/torrent', data, null)
}

function deleteTorrent(hash) {    
    return axios.delete('/torrent/' + hash)
}

class FileListItem extends Component {
    constructor(props) {
        super(props)
        console.info(props.parent)
    }

    render() {
        let model = this.props.torrentModel
        let parent = this.props.parent
        var deleteButton = (
            <button onClick={this.props.deleteTorrentClickedListener.bind(parent, model)}>지우기</button>
        )
    
        var description        
        if (model.status === "Downloading") {
            description = (            
                <li onClick={this.props.itemClickedListener.bind(parent, model)}>
					<img src={logo} alt="logo" />
                    <h3 class="Torrent-item-title">{model.name}</h3> 
                    <p>{model.progress}</p>                       
                    {deleteButton}
                </li>
            )
        } else {
            description = (            
                <li onClick={this.props.itemClickedListener.bind(parent, model)}>
					<img src={logo} alt="logo" />
                    <h3 class="Torrent-item-title">{model.name}</h3> 
                    <p>{model.status}</p>                       
                    {deleteButton}
                </li>
            ) 
        }
        return description
    }
}

class FileList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fileList: []
        }        
    }

    componentDidMount() {
        this.loadFileList()
    }

    render() {  
        let self = this      
        return (
            <div>
                <input type="text" id="magnet-text"/>
                <button type="button" id="request-magnet-button" onClick={this.onRequestButtonClicked}>요청</button>
                <ul className="File-list">
                    {this.state.fileList.map((item) =>                         
                        <FileListItem key={item.id} torrentModel={item} 
                            parent={self}
                            itemClickedListener={this.onItemClicked}
                            deleteTorrentClickedListener={this.onItemDeleteClicked}/>
                    )}                    
                </ul>
            </div>
        )
    }

    loadFileList() {        
        getFileList().then(this.onLoadFileList.bind(this))
    }

    onLoadFileList(response) {                       
        var list = response.data        
        this.setState({
            fileList : list
        })

        list.forEach( t => {
            if (t.status === "Downloading") {                
                this.requestDownloadProgressPolling()
                return
            }
        })
    }

    onUploadRequest() {
        var self = this
        var seletedFile = $("#file-selector").get(0).files[0]
        uploadFile(seletedFile)
            .then(respose => {                
                return respose.headers.location
            })
            .then(_ => {                
                self.loadFileList()
            })   
            .catch(error => {
                console.log(error)
            })
    }

    requestDownloadProgressPolling() {
        setTimeout(this.loadFileList.bind(this), 1000)
    }

    onItemClicked(torrentModel) {        
        // if (torrentModel.status === "Success") {
            ReactDOM.render(<FolderList hash={torrentModel.hash}/>, document.getElementById('root'));
        // }
    }

    onItemDeleteClicked(torrentModel) {
        deleteTorrent(torrentModel.hash).then(this.loadFileList.bind(this))
    }

    onRequestButtonClicked() {
        let magnet = $("#magnet-text")[0]
        var promiss = requestByMagent(magnet.value)
        promiss.then( res => {
            alert("" + res.status + " : " + res.statusText);
        });
    }
}
export default FileList;
