class AssetBuffer { 

constructor(ADIO){
	// future: some "generator" object that can take queries 
	
	// Buffer: 
	this.ADIO = ADIO 

	this.cache_dict = {}; // asset_path:asset_actual
	this.cache_members = []; // earliest asset_path -> latest asset_path 
	// Todo: double buffer. Currently do not do anything.
	this.num_elements_in_cache = 0; // tracking variable
	this.max_buffer_size = 2400; // (for now, arbitrary) number of unique assets to keep in buffer
}

// ------- Image blob getting functions ----------------------------
async get_by_name(filename, fileType){
	if(filename == 'dot'){
		return filename
	}

	try{
		// Requested asset not in buffer. Add it, then return. 
		if (filename in this.cache_dict){
			return this.cache_dict[filename]
		}
		else if (!(filename in this.cache_dict)){
			await this.cache_these_assets(filename, fileType)
			return this.cache_dict[filename]
		}

	}
	catch(error){
		console.error("get_by_name failed with error:", error)
	}
}

// ------- Buffer-related functions --------------------------------
// Add specific asset, or list of assets, to cache before moving on.
async remove_asset_from_cache(filename){

	try{
		window.URL.revokeObjectURL(this.cache_dict[filename].src)
		delete this.cache_dict[filename];
	}
	catch(error){
		console.log('removal of', filename, 'failed with:', error)
	}
	return
}

async clear_cache(){
	return
}

async cache_these_assets(assetNames, fileType){
	//console.log('at cache_these_assets')
	//console.log(assetnames)
	var numRequestedImages = 0
	var lockedImageNames = [] // Requested assetNames that are currently in cache 
	try{

		if (typeof(assetNames) == "string"){
			var filename = assetNames; 

			if (!(filename in this.cache_dict)){
				var asset = await this.ADIO.load_asset(filename, fileType); 
				this.cache_dict[filename] = asset; 
				this.cache_members.push(filename)
				numRequestedImages++
				//this.num_elements_in_cache++
			}
			else{
				lockedImageNames.push(filename)
			}
		}

		
		else if (typeof(assetNames) == "object"){
			var requested_assetNames = []
			for (var i = 0; i < assetNames.length; i ++){
				var filename = assetNames[i]
				if(!(filename in this.cache_dict) && (requested_assetNames.indexOf(filename) == -1)){
					requested_assetNames.push(filename)
				}
				else if(requested_assetNames.indexOf(filename) != -1){
					//console.log('asset already requested')
					continue 
				}
				else if(filename in this.cache_dict){
					//console.log('asset already cached')
					lockedImageNames.push(filename)
					continue
				}
			}
			var asset_array = await this._loadAssetArray(requested_assetNames)
			for (var i = 0; i < asset_array.length; i++){
				this.cache_dict[requested_assetNames[i]] = asset_array[i]; 
				this.cache_members.push(requested_assetNames[i])
				numRequestedImages++ //this.num_elements_in_cache++; 
			}
		}

		
	
		if(numRequestedImages > this.max_buffer_size){
			this.max_buffer_size = numRequestedImages
		}

		this.num_elements_in_cache += numRequestedImages
		if (this.num_elements_in_cache > this.max_buffer_size){

			console.log('Exceeded max buffer size: '+this.num_elements_in_cache+'/'+this.max_buffer_size)
			// Get delete pool 

			// Remove oldest entries that are not locked 

			var overflowAmount = this.num_elements_in_cache - this.max_buffer_size
			var numDeletableOldEntries = Math.max(0, this.max_buffer_size - (numRequestedImages - overflowAmount))
			numDeletableOldEntries  = Math.max(Math.floor(numDeletableOldEntries/2), numRequestedImages) // Delete half of deletable

			// Iterate over first deletableOldEntries and delete the ones that are not locked
			var deletePromiseArray = []
			var numDeleted = 0
			for (var j = 0; j<numDeletableOldEntries; j++){
				if (lockedImageNames.indexOf(this.cache_members[j]) == -1){
					deletePromiseArray.push(this.remove_asset_from_cache(this.cache_members[j]))
					numDeleted = numDeleted+1
				}
				else{
					console.log('skipped deletion of ',j,  this.cache_members[j])
				}
			}

			Promise.all(deletePromiseArray) // Not blocking

			this.cache_members = this.cache_members.slice(numDeletableOldEntries)
			this.cache_members.push(...lockedImageNames) // Push locked assets to end of queue
			this.num_elements_in_cache = this.num_elements_in_cache-numDeleted


			// todo: don't delete entries that were just requested
		}

	}
	catch(error){
		console.error("cache_these_assets failed with error:", error)
	}
}

async _loadAssetArray(assetPathList, assetType){
		try{
			var MAX_SIMULTANEOUS_REQUESTS = 500 // Empirically chosen based on our guess of Dropbox API's download request limit in a "short" amount of time.
			var MAX_TOTAL_REQUESTS = 3000 // Empirically chosen

			if (assetPathList.length > MAX_TOTAL_REQUESTS) {
				throw "Under the Dropbox API, cannot load more than "+MAX_TOTAL_REQUESTS+" assets at a short time period. You have requested "
				+assetPathList.length+". Consider using an asset loading strategy that reduces the request rate on Dropbox."
				return 
			}

			if (assetPathList.length > MAX_SIMULTANEOUS_REQUESTS){
				console.log('Chunking your '+ assetPathList.length+' asset requests into '+Math.ceil(assetPathList.length / MAX_SIMULTANEOUS_REQUESTS)+' chunks of (up to) '+MAX_SIMULTANEOUS_REQUESTS+' each. ')
				var asset_array = []

				for (var i = 0; i < Math.ceil(assetPathList.length / MAX_SIMULTANEOUS_REQUESTS); i++){

					var lb = i*MAX_SIMULTANEOUS_REQUESTS; 
					var ub = i*MAX_SIMULTANEOUS_REQUESTS + MAX_SIMULTANEOUS_REQUESTS; 
					var partial_pathlist = assetPathList.slice(lb, ub);

					// var partial_asset_requests = partial_pathlist.map(loadImagefromDropbox);
					var partial_asset_requests = []
					for (var j = 0; j<partial_pathlist.length; j++){
						partial_asset_requests.push(this.ADIO.load_asset(partial_pathlist[j], assetType))
					}

					var partial_asset_array = await Promise.all(partial_asset_requests)
					asset_array.push(... partial_asset_array); 
				}
				
			}
			else { 
				var asset_requests = assetPathList.map( function(x) {return this.ADIO.load_asset(x, assetType)}); 
				var asset_array = await Promise.all(asset_requests)
			}
			return asset_array
		}
		catch(err){
			console.log(err)
		}

	}

}