
/*
Awesome Uploader
AwesomeUploader JavaScript Class

Documentation for SWFUpload is available at http://demo.swfupload.org/Documentation/

Copyright (c) 2010, Andrew Rymarczyk
All rights reserved.

Redistribution and use in source and minified, compiled or otherwise obfuscated 
form, with or without modification, are permitted provided that the following 
conditions are met:

	* Redistributions of source code must retain the above copyright notice, 
		this list of conditions and the following disclaimer.
	* Redistributions in minified, compiled or otherwise obfuscated form must 
		reproduce the above copyright notice, this list of conditions and the 
		following disclaimer in the documentation and/or other materials 
		provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE 
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL 
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/**
 * @class Ext.ux.upload.AwesomeUploader
 * @extends Ext.container.Container
 */
Ext.define('Ext.ux.upload.AwesomeUploader',{
    extend: 'Ext.container.Container'
    ,alias: 'widget.awesomeuploader'
    ,requires: ['Ext.ux.upload.AwesomeUploaderLocalization']
    ,uses: ['Ext.window.MessageBox']
    
    // configurables
    
    /**
     * @cfg {Boolean} allowDragAndDropAnywhere
     * Defaults to false.
     */
    ,allowDragAndDropAnywhere: false
    /**
     * @cfg {Boolean} alwaysShowFullFilePath
     * Defaults to false.
     */
    ,alwaysShowFullFilePath: false
    /**
     * @cfg {Boolean} autoStartUpload
     * Defaults to false
     */
    ,autoStartUpload: false
    
    /**
     * @cfg {String} awesomeUploaderRoot
     */
    
    /**
     * @cfg {Boolean} disableFlash
     * Defaults to false.
     */
    ,disableFlash: false
    /**
     * @cfg {Boolean} enableDD
     * Defaults to false.
     */
    ,enableDD: false
    /**
     * @cfg {Boolean} enableMultiple
     * Indicates if the file dialog allows for multiple selections.  Defaults to true.
     */
    ,enableMultiple: true
    
    /**
     * @cfg {Object} extraPostData
     * Params that will be sent in the POST for all files uploaded.
     */
    
    /**
     * @cfg {String} fileTypes
     */
    ,fileTypes: '*.*'
    
    /**
     * @cfg {String} fileTypesDescription
     * {@link Ext.ux.upload.AwesomeUploader.Localization#browseWindowFileDescription}
     */
    
    /**
     * @cfg {String} flashButtonCursor
     * Supports 'arrow' or 'hand'.  Defaults to 'hand'
     */
    
    /**
     * @cfg {String} flashButtonSprite
     * The url for a sprite used for displaying the flash button.
     */
    
    /**
     * @cfg {String} locale
     */
    ,locale: 'english'
    /**
     * @cfg {Number} maxFileSizeBytes
     * Defaults to 3145728 (3 MiB).
     * 3 * 1024 * 1024 = 3 MiB
     */
    ,maxFileSizeBytes: 3145728
    /**
     * @cfg {Boolean} supressPopups
     * Defaults to false
     */
    ,supressPopups: false
    
    //constants
    /**
     * @static
     * @type String
     */
    ,STATUS_ABORTED: 'aborted'
    /**
     * @static
     * @type String
     */
    ,STATUS_COMPLETE: 'completed'
    /**
     * @static
     * @type String
     */
    ,STATUS_ERROR: 'error'
    /**
     * @static
     * @type String
     */
    ,STATUS_QUEUED: 'queued'
    /**
     * @static
     * @type String
     */
    ,STATUS_REMOVED: 'removed'    
    /**
     * @static
     * @type String
     */
    ,STATUS_STARTED: 'started'
    
    /**
     * @private
     */
	,constructor:function(config){
        config = config || {};
        
		var me = this
            ,root = config.awesomeUploaderRoot || me.awesomeUploaderRoot || ''
            ,locale = config.locale || me.locale || 'english'
            ,lang = Ext.create('Ext.ux.upload.AwesomeUploaderLocalization');
        
		me.addEvents(
            /**
             * @event buttonready 
             * Fires when the user interface button is loaded and ready.
             * @param {Ext.ux.upload.AwesomeUploader} this 
             */
            'buttonready'        
            /**
             * @event fileselected
             * Fires when the user selects a file.  
             * Fired for each file if multiple file selection is available.
             * @param {Ext.ux.upload.AwesomeUploader} this
             * @param {Object} fileInfo
             */
            ,'fileselected'
            /**
             * @event fileselectionerror
             * Fires when the selected file either exceeds the maximum file size, 
             * is 0-bytes, or the file type does not match the "flashSwfUploadFileTypes" mask
             * @param {Ext.ux.upload.AwesomeUploader} this
             * @param {Object} fileInfo
             * @param {String} message
             */        
            ,'fileselectionerror'
            /**
             * @event uploadstart
             * Fires when the user initiates uploading of a file.  
             * May be called multiple times for drag&drop uploads.
             * @param {Ext.ux.upload.AwesomeUploader} this
             * @param {Object} fileInfo
             */            
            ,'uploadstart'
            /**
             * @event uploadprogress
             * Fires when an upload progress event is received.
             * @param {Ext.ux.upload.AwesomeUploader} this
             * @param {Object} fileInfo
             * @param {Number} bytesLoaded
             * @param {Number} bytesTotal
             */            
            ,'uploadprogress'
            /**
             * @event uploadcomplete
             * Fires when a file upload completes.
             * @param {Ext.ux.upload.AwesomeUploader} this
             * @param {Object} fileInfo
             * @param {Object} response The server response object will at minimum have a property "error" describing the error.
             */            
            ,'uploadcomplete' 
            /**
             * @event uploadremoved
             * Fires when the user removes a file from the queue.
             * @param {Ext.ux.upload.AwesomeUploader} this
             * @param {Object} fileInfo
             */            
            ,'uploadremoved'
            /**
             * @event uploadaborted
             * Fires when the user aborts the upload.
             * @param {Ext.ux.upload.AwesomeUploader} this
             * @param {Object} fileInfo
             * @param {String} message //TODO: optional?
             */            
            ,'uploadaborted'
            /**
             * @event uploaderror
             * Fires when an error occurs during the file upload.
             * @param {Ext.ux.upload.AwesomeUploader} this
             * @param {Object} fileInfo
             * @param {String} message
             */            
            ,'uploaderror'
		);

        
        Ext.applyIf(config, {
            awesomeUploaderRoot: root
            ,debug: false
            ,i18n: lang
            ,locale:locale
            ,flashButtonSprite:root+'swfupload_browse_button_trans_56x22.PNG'
            ,flashButtonWidth:56
            ,flashButtonHeight:22
            ,flashUploadFilePostName:'Filedata'
            ,flashSwfUploadPath:root+'swfupload.swf'
            ,fileTypesDescription:lang[locale].browseWindowFileDescription
            ,flashUploadUrl:root+'upload.php'
            ,xhrUploadUrl:root+'xhrupload.php'
            ,xhrFileNameHeader:'X-File-Name'
            ,xhrExtraPostDataPrefix:'extraPostData_'
            ,xhrFilePostName:'Filedata'
            ,xhrSendMultiPartFormData:false
            ,standardButtonText: lang[locale].browseButtonText
            ,standardUploadFilePostName:'Filedata'
            ,standardUploadUrl:root+'upload.php'
            ,extraPostData:{}
            ,swfUploadStopped:false
            //,width:56
            //,height:22
            ,fileId:0 //counter for unique file ids
            ,fileQueue:{}
            ,swfUploadQueue:{}
            ,width: 300
            //PC110310: disable over-nesting
//          ,items:{
//              //upload button container
//              listeners:{
//                  scope:me
//                  ,render:function(){
//                      me.initSWFUpload();
//                      me.initDragAndDropUploader();
//                  }
//              }
//          }            
        });
                
        me.callParent(arguments);
	}//eof initComponent
    
    /**
     * @private
     */
    ,onRender: function(){
        var me = this;
        
        me.callParent(arguments);
        
        if(me.disableFlash){
            me.initStandardUpload();
        } else {
            me.initSWFUpload();
        }
        if (me.enableDD){
            me.initDragAndDropUploader();
        }
    }//eof onRender
    
    /**
     * Begin uploading all queued files.
     */
    ,startAllUploads: function(){
        var fileId;
        for(fileId in this.fileQueue){
            this.startUpload(fileId);
        }
    } //eof startAllUploads
    
    /**
     * Begin uploading a file specified by fileId.
     * @param {Number} fileId
     */
	,startUpload:function(fileId){
        var me = this
            ,stats;
            
		if(me.fileQueue[fileId].status === me.STATUS_STARTED){
			return;
		}
		switch(me.fileQueue[fileId].method){
			case 'swfupload':
				me.swfUploadStopped = false;
				if(me.fileQueue[fileId].status == me.STATUS_ERROR ){
					me.swfUploader.requeueUpload(me.fileQueue[fileId].swfuploadFile.id);
				}
				
				stats = me.swfUploader.getStats();
				if(stats.in_progress === 1){ //a file upload is currently in progress
					break;
				}
				me.swfUploadUploadStart();
				break;
			case 'standard':
				me.standardUploadStart(me.fileQueue[fileId]);
				break;
			case 'dnd':
				me.dragAndDropUploadStart(me.fileQueue[fileId]);
				break;
		}
	}//eof startUpload
    
    /**
     * Abort all files in the queue.
     */
	,abortAllUploads:function(){
		var fileId;
		for(fileId in this.fileQueue){
			this.abortUpload(fileId);
		}
	}//eof abortAllUploads
    
    /**
     * Abort a specific file upload.
     * @param {Number} fileId
     */
	,abortUpload:function(fileId){
	
		if(this.fileQueue[fileId].status == this.STATUS_STARTED){
		
		switch(this.fileQueue[fileId].method){
			case 'swfupload':
					this.swfUploadStopped = true;
					this.swfUploader.stopUpload();
				break;
			case 'standard':
					if(this.fileQueue[fileId].frame.contentWindow.stop){// Firefox
						this.fileQueue[fileId].frame.contentWindow.stop();
					}
					if(Ext.isIE){
						window[this.fileQueue[fileId].frame.id].document.execCommand('Stop');
					}
				break;
			case 'dnd':
				this.fileQueue[fileId].upload.xhr.abort();
				break;
		}
		this.fileQueue[fileId].status = this.STATUS_ABORTED;
			this.fireEvent('uploadaborted', this, Ext.apply({}, this.fileQueue[fileId]), 'User aborted');
        }
	}//eof abortUpload
    
    
    /**
     * Assign a name/value pair that will be sent in the POST with the file specified.
     * @param {Number} fileId
     * @param {String} name
     * @param {String} value
     */
    ,addFileParam: function(fileId, name, value){
        var me = this;
        
        if(me.fileQueue[fileId].status !== me.STATUS_QUEUED){ 
            throw 'Parameters can only be assigned before a file upload has started.';
        }
        
        me.swfUploader.addFileParam(me.fileQueue[fileId].swfuploadFile.id, name, value);
    }//eof addFileParam
    
    /**
     * Remove all files from queue.
     */
	,removeAllUploads:function(){
		var fileId;
		for( fileId in this.fileQueue){
			this.removeUpload(fileId);
		}
	}//eof removeAllUploads
    
    /**
     * Abort and remove a specific upload by fileId.
     * @param {Number} fileId
     */
	,removeUpload:function(fileId){
		if(this.fileQueue[fileId].status === this.STATUS_STARTED){
			this.abortUpload(fileId);
		}
		switch(this.fileQueue[fileId].method){
			case 'swfupload':
				this.swfUploader.cancelUpload(this.fileQueue[fileId].swfuploadFile.id, false);
				break;
        }
    
		this.fileQueue[fileId].status = this.STATUS_REMOVED;
		var fileInfo = {
			id: fileId
			,name: this.fileQueue[fileId].name
			,size: this.fileQueue[fileId].size
		};
		delete this.fileQueue[fileId];
		this.fireEvent('uploadremoved', this, fileInfo);
	}//eof removeUpload
    
    /**
     * @private
     */
	,initSWFUpload:function(){
        var me = this
            ,settings = {
                 button_action: me.enableMultiple ? SWFUpload.BUTTON_ACTION.SELECT_FILES : SWFUpload.BUTTON_ACTION.SELECT_FILE
                ,button_cursor: (me.flashButtonCursor === 'arrow' ? SWFUpload.CURSOR.ARROW : SWFUpload.CURSOR.HAND)
                ,button_disabled: me.disabled
                ,button_image_url: me.flashButtonSprite
                ,button_height: me.flashButtonHeight
                ,button_placeholder: me.el.dom //me.items.items[0].el.dom
                ,button_width: me.flashButtonWidth
                ,button_window_mode: SWFUpload.WINDOW_MODE.OPAQUE
                ,debug: me.debug
                ,file_dialog_complete_handler: Ext.bind(me.swfUploadFileDialogComplete,me)
                ,file_post_name: me.flashUploadFilePostName
                ,file_queue_error_handler: Ext.bind(me.swfUploadFileQueError,me)
                ,file_queue_limit: 0
                ,file_queued_handler: Ext.bind(me.swfUploadfileQueued,me)
    			,file_size_limit: me.maxFileSizeBytes + ' B'
    			,file_types: me.fileTypes
    			,file_types_description: me.flashSwfUploadFileTypesDescription
    			,file_upload_limit: 100
                ,flash_url: me.flashSwfUploadPath
                ,minimum_flash_version: '9.0.28'
                ,post_params: me.extraPostData
                ,swfupload_load_failed_handler: Ext.bind(me.initStandardUpload,me)
                ,swfupload_loaded_handler: Ext.bind(me.onButtonReady,me)
                ,upload_complete_handler: Ext.bind(me.swfUploadComplete,me)
    			,upload_error_handler: Ext.bind(me.swfUploadUploadError,me)
    			,upload_progress_handler: Ext.bind(me.swfUploadUploadProgress,me)
                ,upload_start_handler: Ext.bind(me.swfUploadUploadStarted,me)
    			,upload_success_handler: Ext.bind(me.swfUploadSuccess,me)
                ,upload_url: me.flashUploadUrl
    		};
            
		me.swfUploader = new SWFUpload(settings);
	} //eof initSWFUpload
    
    /**
     * @private
     */
	,initDragAndDropUploader:function(){

		this.el.on({
			dragenter:function(event){
				event.browserEvent.dataTransfer.dropEffect = 'move';
				return true;
			}
			,dragover:function(event){
				event.browserEvent.dataTransfer.dropEffect = 'move';
				event.stopEvent();
				return true;
			}
			,drop:{
				scope:this
				,fn:this.processDragAndDropUpload
			}
		});
		
		var body = Ext.fly(document.body);
			
		if(this.allowDragAndDropAnywhere){
			
			body.on({
				dragenter:function(event){
					event.browserEvent.dataTransfer.dropEffect = 'move';
					return true;
				}
				,dragover:function(event){
					event.browserEvent.dataTransfer.dropEffect = 'move';
					event.stopEvent();
					return true;
				}
				,drop:{
					scope:this
					,fn:this.processDragAndDropUpload
				}
			});

		}else{
			// Attach drag and drop listeners that do nothing to the document body
			// this prevents incorrect drops, reloading the page with the dropped item
			// This may or may not be helpful
			if(!document.body.BodyDragSinker){
				document.body.BodyDragSinker = true;
				
				body.on({
					dragenter:function(event){
						return true;
					}
					,dragleave:function(event){
						return true;
					}
					,dragover:function(event){
						event.stopEvent();
						return true;
					}
					,drop:function(event){
						event.stopEvent();
						return true;
					}
				});
			}
		}
		
	}//eof initDragAndDropUploader
    
    /**
     * @private
     */
	,initStandardUpload:function(){
        var me = this;
        
		if(me._fuf){
			me._fuf.fileInput = null; //remove reference to file field. necessary to prevent destroying file field during an active upload.
			Ext.destroy(me._fuf);
		}

		me._fuf = Ext.create('Ext.form.field.File',{
			renderTo:me.el // me.items.items[0].el
			,buttonText:me.standardButtonText
			,buttonOnly:true
			,name:me.standardUploadFilePostName
			,listeners:{
                 'afterrender': me.onButtonReady
				,'fileselected': me.standardUploadFileSelected
				,scope:me
			}
		});
	} //eof initStandardUpload
    
    /**
     * @private
     * @param {String} text
     * @return {Boolean}
     */
	,uploaderAlert:function(text){
        var me = this;
        
		if(me.supressPopups){ return true; }
        
        if(me.uploaderAlertMsg === undefined || !me.uploaderAlertMsg.isVisible()){
			me.uploaderAlertMsgText = me.i18n[me.locale].uploaderAlertErrorPrefix +'<BR>'+ text;
			me.uploaderAlertMsg = Ext.Msg.show({
				title: me.i18n[me.locale].uploaderAlertErrorPrefix
				,msg: me.uploaderAlertMsgText
				,buttons: Ext.Msg.OK
//				,modal:false
				,icon: Ext.Msg.ERROR
			});
		}else{
			me.uploaderAlertMsgText += text;
			me.uploaderAlertMsg.updateText(me.uploaderAlertMsgText);
//			me.uploaderAlertMsg.getDialog().focus();
		}
		
	} //eof uploaderAlert
    
    /**
     * @private
     * @param {Event} event
     */
	,processDragAndDropUpload:function(event){
        var files, len;
        
		event.stopEvent();
		if(event.browserEvent.dataTransfer && event.browserEvent.dataTransfer.files){
			files = event.browserEvent.dataTransfer.files;
			len = files.length;
			while(--len >= 0){
				this.processDragAndDropFileUpload(files[len]);
			}
		}
	}//eof processDragAndDropUpload
    
    /**
     * @private
     * @param {Object} fileInfo
     */
	,dragAndDropUploadStart:function(fileInfo){
		var upload = Ext.create('Ext.ux.XHRUpload',{
			url:this.xhrUploadUrl
			,filePostName:this.xhrFilePostName
			,fileNameHeader:this.xhrFileNameHeader
			,extraPostData:this.extraPostData
			,sendMultiPartFormData:this.xhrSendMultiPartFormData
			,file:fileInfo.file
			,listeners:{
				scope:this
				,uploadloadstart:function(event){
                    fileInfo.status = this.STATUS_STARTED;
					this.fireEvent('uploadstart', this, Ext.apply({}, fileInfo) );
				}
				,uploadprogress:function(event){
					this.fireEvent('uploadprogress', this, fileInfo, event.loaded, event.total);
				}
				// XHR Browser Events
				,loadstart:function(event){
					fileInfo.status = this.STATUS_STARTED;
					this.fireEvent('uploadstart', this, Ext.apply({}, fileInfo) );
				}
				,progress:function(event){
					this.fireEvent('uploadprogress', this, Ext.apply({}, fileInfo), event.loaded, event.total);
				}
				,abort:function(event){
					fileInfo.status = this.STATUS_ABORTED;
					this.fireEvent('uploadaborted', this, Ext.apply({}, fileInfo), 'XHR upload aborted');
				}
				,error:function(event){
					fileInfo.status = this.STATUS_ERROR;
					this.fireEvent('uploaderror', this, Ext.apply({}, fileInfo), 'XHR upload error');
				}
				,load:function(event){
					this.processUploadResult(fileInfo, upload.xhr.responseText);
				}
			}
		});
		fileInfo.upload = upload;
		upload.send();
	}//eof dragAndDropUploadStart
    
    /**
     * @private
     * @param {Object} file
     * @return {Boolean}
     */
	,processDragAndDropFileUpload:function(file){
		var fileInfo = {
			id: ++this.fileId
			,name: file.name
			,size: file.size
			,status:this.STATUS_QUEUED
			,method: 'dnd'
			,file: file
		};
		
		if(fileInfo.size > this.maxFileSizeBytes){
			this.uploaderAlert('<BR>'+ file.name + this.i18n[this.locale].fileSizeError);
			this.fireEvent('fileselectionerror', this, Ext.apply({}, fileInfo), this.i18n[this.locale].fileSizeEventText);
			return true;
		}
		if(false !== this.fireEvent('fileselected', this, Ext.apply({},fileInfo) ) ){
			this.fileQueue[fileInfo.id] = fileInfo;
			if(this.autoStartUpload){
				this.dragAndDropUploadStart(fileInfo);
			}
		}
	}//eof processDragAndDropFileUpload
    

    
    /**
     * Removes a name/value pair from the POST that was added using addFileParam.
     * @param {Number} fileId
     * @param {String} name
     */
    ,removeFileParam: function(fileId, name){
        var me = this;
        
        me.swfUploader.removeFileParam(me.fileQueue[fileId].swfuploadFile.id, name);
    }//eof removeFileParam
    
    /**
     * @private
     */
    ,onButtonReady: function(){
        this.fireEvent('buttonready',this);
    } //eof onButtonReady
    
    /**
     * @private
     * @param {Object} file
     * @return {Boolean}
     */
	,swfUploadfileQueued:function(file){
		var fileInfo = {
			id: ++this.fileId
			,name: file.name
			,size: file.size
			,status:this.STATUS_QUEUED
			,method: 'swfupload'
			,swfuploadFile: file
		}
		if(false !== this.fireEvent('fileselected', this, Ext.apply({},fileInfo) ) ){
			this.fileQueue[fileInfo.id] = fileInfo;
			this.swfUploadQueue[file.id] = fileInfo;
		}else{
			this.swfUploader.cancelUpload(file.id, false);	
		}
		return true;
	}//eof swfUploadfileQueued
    
    /**
     * @private
     * @param {Object} file
     * @param {Mixed} error
     * @param {String} message
     */
	,swfUploadFileQueError:function(file, error, message){
		var fileInfo = {
			id: ++this.fileId
			,name: file.name
			,size: file.size
			,status:this.STATUS_ERROR
			,method: 'swfupload'
		}
		this.uploaderAlert('<BR>'+fileInfo.name+'<BR><b>'+message+'</b><BR>');
		this.fireEvent('fileselectionerror', this, Ext.apply({}, fileInfo), message);
	}//eof swfUploadFileQueError
    
    /**
     * @private
     */
	,swfUploadUploadStart:function(){
		this.swfUploader.setPostParams(this.extraPostData); //sync post data with flash
		this.swfUploader.startUpload();
	}//eof swfUploadUploadStart
    
    /**
     * @private
     */
	,swfUploadFileDialogComplete:function(){
		if(this.autoStartUpload){
			this.swfUploadUploadStart();
		}
	}//eof swfUploadFileDialogComplete
    
    /**
     * @private
     * @param {Object} file
     * @param {Number} bytesComplete
     * @param {Number} bytesTotal
     */
	,swfUploadUploadProgress:function(file, bytesComplete, bytesTotal){
		this.fireEvent('uploadprogress', this, this.swfUploadQueue[file.id], bytesComplete, bytesTotal);	
	}//eof swfUploadUploadProgress
    
    /**
     * @private
     * @param {Object} file
     */
	,swfUploadUploadStarted:function(file){
		this.swfUploadQueue[file.id].status = this.STATUS_STARTED;
		this.fireEvent('uploadstart', this, Ext.apply({}, this.swfUploadQueue[file.id]));
	}//eof swfUploadUploadStarted

    /**
     * @private
     * @param {Object} file
     */
	,swfUploadComplete:function(file){ //called if the file is errored out or on success
		if(!this.swfUploadStopped ){
			this.swfUploader.startUpload(); //as per the swfupload docs, start the next upload!
		}
	}//eof swfUploadComplete
    
    /**
     * @private
     * @param {Object} file
     * @param {Number} errorCode
     * @param {String} message
     * @return {Boolean}
     */
	,swfUploadUploadError:function(file, errorCode, message){

		if(errorCode == SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED){ //-290 = "UPLOAD_STOPPED"
			return true;
		}
		
		this.swfUploadQueue[file.id].status = this.STATUS_ERROR;
		this.uploaderAlert('<BR>'+file.name+'<BR><b>'+message+'</b><BR>');//SWFUpload.UPLOAD_ERROR_DESC[errorCode.toString()]

		this.fireEvent('uploaderror', this, Ext.apply({}, this.swfUploadQueue[file.id]), message);
	}//eof swfUploadUploadError
    
    /**
     * @private
     * @param {Object} file
     * @param {Object} serverData
     */
	,swfUploadSuccess:function(file, serverData){ //called when the file is done
		this.processUploadResult(this.swfUploadQueue[file.id], serverData);
	}//eof swfUploadSuccess
		
    /**
     * @private
     * @param {Ext.ux.form.FileUploadField} fileBrowser
     * @param {String} fileName
     * @return {Boolean}
     */
	,standardUploadFileSelected:function(fileBrowser, fileName){
		if(!this.alwaysShowFullFilePath){
			var lastSlash = fileName.lastIndexOf('/'); //check for *nix full file path
			if( lastSlash < 0 ){
				lastSlash = fileName.lastIndexOf('\\'); //check for win full file path
			}
			if( lastSlash > 0){
				fileName = fileName.substr(lastSlash+1);
			}
		}
		
		var fileInfo = {
			id: ++this.fileId
			,name:fileName
			,status:this.STATUS_QUEUED
			,method:'standard'
			,size:'0'
		};
		
		if(Ext.isDefined(fileBrowser.fileInput.dom.files) ){
			fileInfo.size = fileBrowser.fileInput.dom.files[0].size;
		};
		
		if( fileInfo.size > this.maxFileSizeBytes){
			this.uploaderAlert('<BR>'+ fileInfo.name + this.i18n[this.locale].fileSizeError);
			this.fireEvent('fileselectionerror', this, Ext.apply({}, fileInfo), this.i18n[this.locale].fileSizeEventText);
			return true;
		}
		//save reference to filebrowser
		fileInfo.fileBrowser = fileBrowser; 
		
		var formEl = document.createElement('form'),
			extraPost;

        formEl = this.el.appendChild(formEl); //PC010311: this.items.items[0].el.appendChild(formEl);
		
		fileInfo.fileBrowser.fileInput.addCls('au-hidden');
	
		formEl.appendChild(fileBrowser.fileInput); //add reference from current file browser file input to this newly created form el
		formEl.addCls('au-hidden');
		fileInfo.form = formEl;
		
		this.initStandardUpload(); //re-init uploader for multiple simultaneous uploads
		
		if(false !== this.fireEvent('fileselected', this, Ext.apply({},fileInfo) ) ){
			
    		if(this.autoStartUpload){
    			this.standardUploadStart(fileInfo);
    		}
    		this.fileQueue[fileInfo.id] = fileInfo;
		}
		
	}//eof standardUploadFileSelected
    
    /**
     * @private
     * @param {Object} fileInfo
     */
	,doFormUpload : function(fileInfo){ //o, extraPostData, url){ //based off of Ext.Ajax.doFormUpload
		var id = Ext.id()
			,doc = document
			,frame = doc.createElement('iframe')
			,form = Ext.getDom(fileInfo.form)
			,hiddens = []
			,hd
			,encoding = 'multipart/form-data'
			,buf = {
				target: form.target,
				method: form.method,
				encoding: form.encoding,
				enctype: form.enctype,
				action: form.action
			};

		/*
		 * Originally this behaviour was modified for Opera 10 to apply the secure URL after
		 * the frame had been added to the document. It seems this has since been corrected in
		 * Opera so the behaviour has been reverted, the URL will be set before being added.
		 */
		Ext.fly(frame).set({
			id: id,
			name: id,
			cls: 'x-hidden',
			src: Ext.SSL_SECURE_URL
		}); 

		doc.body.appendChild(frame);

		// This is required so that IE doesn't pop the response up in a new window.
		if(Ext.isIE){
			document.frames[id].name = id;
		}
		Ext.fly(form).set({
			target: id,
			method: 'post',
			enctype: encoding,
			encoding: encoding,
			action: this.standardUploadUrl || buf.action
		});

		Ext.iterate(this.extraPostData, function(k, v){
			hd = doc.createElement('input');
			Ext.fly(hd).set({
				type: 'hidden',
				value: v,
				name: k
			});
			form.appendChild(hd);
			hiddens.push(hd);
		});

		function cb(){
			var responseText = '',
				doc;

			try{
				doc = frame.contentWindow.document || frame.contentDocument || window.frames[id].document;
				if(doc){
					if(doc.body){
						responseText = doc.body.innerHTML;
					}
				}
			}
			catch(e) {}

			Ext.EventManager.removeListener(frame, 'load', cb, this);
			Ext.EventManager.removeListener(frame, 'abort', uploadAborted, this);
			
			this.processUploadResult(fileInfo, responseText);
		
			setTimeout(function(){Ext.removeNode(frame);}, 100);
		}

		Ext.EventManager.on(frame, 'load', cb, this);
		var uploadAborted = function(){
			this.standardUploadFailAbort(fileInfo);
		}
		Ext.EventManager.on(frame, 'abort', uploadAborted, this);
		
		fileInfo.frame = frame;
	
		form.submit();

		Ext.fly(form).set(buf);
		Ext.each(hiddens, function(h){
			Ext.removeNode(h);
		});
	}//eof doFormUpload
    
    /**
     * @private
     * @param {Object} fileInfo
     */
	,standardUploadStart:function(fileInfo){
		this.doFormUpload(fileInfo);
		fileInfo.status = this.STATUS_STARTED;
		this.fireEvent('uploadstart', this, Ext.apply({}, fileInfo));
	}//eof standardUploadStart
    
    /**
     * @private
     * @param {Object} form
     * @param {Object} action
     */
	,standardUploadFail:function(form, action){
		this.uploaderAlert('<BR>'+form.fileInfo.name+'<BR><b>'+action.result+'</b><BR>');
		form.fileInfo.status = this.STATUS_ERROR;
		this.fireEvent('uploaderror', this, Ext.apply({}, form.fileInfo), action.result, action.response.responseText);
	}//eof standardUploadFail
    
    /**
     * @private
     * @param {Object} fileInfo
     */
	,standardUploadFailAbort:function(fileInfo){
		this.uploaderAlert('<BR>'+ fileInfo.name + this.i18n[this.locale].uploadAbortedMessage);
		form.fileInfo.status = this.STATUS_ERROR;
		this.fireEvent('uploaderror', this, Ext.apply({}, fileInfo), 'aborted');
	}//eof standardUploadFailAbort

    /**
     * @private
     * @param {Object} fileInfo
     * @param {Object} serverData
     */
	,processUploadResult:function(fileInfo, serverData){
		var uploadCompleteData = {};
        fileInfo.status = this.STATUS_COMPLETE;
		if(false !== this.fireEvent('uploadcomplete', this, Ext.apply({},fileInfo), serverData, uploadCompleteData ) ){
			//
		}else{
			this.uploaderAlert('<BR>'+ this.i18n[this.locale].uploadErrorMessage +' <b>'+fileInfo.name+'</b><BR>');
			fileInfo.status = this.STATUS_ERROR;
			this.fireEvent('uploaderror', this, Ext.apply({}, fileInfo), serverData, uploadCompleteData);
		}
	}//eof processUploadResult
    
    /**
     * @private
     */
    ,onDestroy: function(){
        //Objects we created must therefore get destroyed explicitly
        Ext.destroy(this._fuf,this.swfUploader);
        
        //destroy our references only - this will take care of the rest        
        this._fuf = //file upload field
        this.swfUploader = //flash uploader
            null;

        this.callParent(arguments);            
    }//eof onDestroy
    
    /**
     * @private
     * OVERLOADS parent
     */
    ,onDisable: function(){
        this.callParent(arguments);
        
		if(this._fuf){
			this._fuf.disable();
		}else{
        	this.swfUploader.setButtonDisabled(true);
       	}
    }//eof onDisable
    
    /**
     * @private
     * OVERLOADS parent
     */
    ,onEnable: function(){
        this.callParent(arguments);
        
        if(this._fuf){
        	this._fuf.enable();
        }else{
	        this.swfUploader.setButtonDisabled(false);
	    }
    }//eof onDisable    
});

//end of file