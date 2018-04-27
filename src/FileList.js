import React, { Component } from 'react';
import axios from 'axios'
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

class FileListItem extends Component {
    constructor(props) {
        super(props)        
    }

    render() {
        let model = this.props.torrentModel
        var description
        if (model.status === "Downloading") {
            description = (            
                <li>
                    <h3>{model.name}</h3> 
                    <p>{model.progress}</p>                       
                </li>
            )
        } else {
            description = (            
                <li>
                    <h3>{model.name}</h3> 
                    <p>{model.status}</p>                       
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
        return (
            <div>
                <header className="App-header">
                    <h1>Welcome</h1>
                </header>
                <ul className="File-list">
                    {this.state.fileList.map((item) =>                         
                        <FileListItem key={item.id} torrentModel={item}/>
                    )}                    
                </ul>
                <input type="file" id="file-selector" onChange={this.onUploadRequest}/>   
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
        var seletedFile = $("#file-selector").get(0).files[0]
        uploadFile(seletedFile)
            .then(respose => {                
                var uploadFileUrl = respose.headers.location
                addTorrent(uploadFileUrl)                
            })
            .catch(error => {
                console.log(error)
            })
    }

    requestDownloadProgressPolling() {
        setTimeout(this.loadFileList.bind(this), 1000)
    }
}
export default FileList;