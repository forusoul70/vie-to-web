import React, { Component } from 'react';
import axios from 'axios'
import './FolderList.css';
import $ from 'jquery';

function queryFolder(hash) {
    return axios.get('/torrent/folder/' + hash)
}

function redirectViewFile(path) {
    var location = encodeURI("/stream?path=" + path)
    window.location.href = location
}

class FolderListItem extends Component {
    render() {
        let model = this.props.fileItemModel
        return (            
            <li>
                <h3>{model.name}</h3> 
                <p>{model.path}</p>                       
                <p>{model.mimeType}</p>
                <button onClick={this.props.viewButtonClickListener.bind(undefined, model)}>보기</button>
            </li>
        )
    }    
}


class FolderList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            folderList: []
        }        
    }

    render() {        
        return (
            <div>                
                <ul className="Folder-list">
                    {this.state.folderList.map((item) =>                         
                        <FolderListItem key={item.name} fileItemModel={item}
                        viewButtonClickListener={this.onFileClick}/>
                    )}                    
                </ul>                
            </div>
        )
    }

    componentDidMount() {
        queryFolder(this.props.hash).then(response => {                        
            this.setState ({
                folderList : response.data
            })
        })
    }

    onFileClick(file) {
        redirectViewFile(file.path)
    }
}

export default FolderList;
