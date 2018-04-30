import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import FolderList from './FolderList';
import './FileList.css';
import $ from 'jquery';

function getFileList() {
    return axios.get('/torrent/list')
}

function uploadFile(file) {    
    var data = new FormData()
    data.append('file', file)
    return axios.post('/file', data, null)    
}

function addTorrent(url) {
    var data = {fileUri : url}
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
                    <h3>{model.name}</h3> 
                    <p>{model.progress}</p>                       
                    {deleteButton}
                </li>
            )
        } else {
            description = (            
                <li onClick={this.props.itemClickedListener.bind(parent, model)}>
                    <h3>{model.name}</h3> 
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
                <header className="App-header">
                    <h1>Welcome</h1>
                </header>
                <ul className="File-list">
                    {this.state.fileList.map((item) =>                         
                        <FileListItem key={item.id} torrentModel={item} 
                            parent={self}
                            itemClickedListener={this.onItemClicked}
                            deleteTorrentClickedListener={this.onItemDeleteClicked}/>
                    )}                    
                </ul>
                <input type="file" id="file-selector" onChange={this.onUploadRequest.bind(this)}/>   
            </div>
        )
    }

    loadFileList() {        
        getFileList().then(this.onLoadFileList.bind(this))
    }

    onLoadFileList(response) {                       
        var list = response.data
        console.info(list)
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
                var uploadFileUrl = respose.headers.location
                return addTorrent(uploadFileUrl)                
            })
            .then(_ => {                
                self.loadFileList()
            })   
            .catch(error => {
                console.log(error)
            })
    }

    requestDownloadProgressPolling() {
        // setTimeout(this.loadFileList.bind(this), 1000)
    }

    onItemClicked(torrentModel) {        
        if (torrentModel.status === "Success") {
            ReactDOM.render(<FolderList hash={torrentModel.hash}/>, document.getElementById('root'));
        }
    }

    onItemDeleteClicked(torrentModel) {
        deleteTorrent(torrentModel.hash).then(this.loadFileList.bind(this))
    }
}
export default FileList;