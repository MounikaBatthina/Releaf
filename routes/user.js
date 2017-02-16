
/*
 * GET users listing.
 */

var ejs = require('ejs');
var mongo = require("./mongodb");
var mongoURL = "mongodb://localhost:27017/reyleaf";
var ObjectID = require('mongodb').ObjectId;
var session = require('client-sessions');
exports.list = function(req, res){
  res.send("respond with a resource");
};


exports.releafSample = function(req, res){
	ejs.renderFile("./views/index.ejs",function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
};

// USER SIGNIN 
exports.signIn = function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	req.session.username=username;
	req.session.admin_flag= false;
	req.session.user_flag= false;
	
	mongo.connect(mongoURL,function(){
		var admin= mongo.collection('admins');
		var users= mongo.collection('users');
		//Check for Admins or Users
		admin.findOne({admin_username:username,admin_pw:password},function(err,result){
			if(!err){
				if(result !== null){
					req.session.admin_flag= true;
					res.send({
						"status_code" : 200
					});
					}else{
						users.findOne({user_username:username,user_pw:password},function(err,result){
							if(!err){
									if(result !== null){	
										req.session.user_flag= true;
											res.send({
												"status_code" : 200
											});
									}else{
										   res.send({
											   "status_msg" : "No users or admins found",
												"status_code" : 400
											});
									}
							}else{
								 res.send({	
											"status_code" : 400,
											 "status_msg" : "Error occured while finding user"
										});
							}});
				}	
			}else{
				res.send({
					"status_code" : 400,
					"status_msg" : "No users or admins found"
				});
			}
		});
	});
};

//Add Company Details
exports.addCompany = function(req, res){	
	//Check For Admin Login
	  if(req.session.admin_flag){
		var name = req.body.name;
		var num_employees = req.body.num_employees;
		var year_founded = req.body.year_founded;
		var contact_name = req.body.contact_name;
		var contact_email = req.body.contact_email;
		var rankings =  {
			financials: req.body.rankings.financials,
			team: req.body.rankings.team,
			idea: req.body.rankings.idea
		}
		var companyDetails = {
				name : name,
				num_employees: num_employees,
				year_founded: year_founded,
				contact_name: contact_name,
				contact_email: contact_email,
				rankings: {
					financials: rankings.financials,
					team: rankings.team,
					idea: rankings.idea
				}
		};	
		mongo.connect(mongoURL, function(){
	        console.log('Connected to mongo at: ' + mongoURL);
	        var company = mongo.collection('companies');
	        company.findOne({name:name},function(err,result){
	    	   if(err){
	    		   res.end('An error occured while finding');
	    	   }
	    	   else{
	    		   if(result != null){
	    			   console.log("Company Already Exists");
	    			   res.end('Already Exits!');
	    		   }else{
	    			   company.insert(companyDetails, function(err, result){
	    		        	if(!err){
	    		        		res.send({
	    		                	"status_code" : 200
	    		                });
	    		        	}else{
	    		        		console.log("Error Occured while inserting into DB");
	    		        		res.send({
	    		        			"status_message" :'Error Occured while inserting into DB',
	    		        			"status_code" : 400
	    		        		});
	    		        	}
	    		        });
	    		   }
	    	   } 
	       });    
		});
	}else{
  	  res.end('Access Denied!')
    }
};

//Remove Company 
exports.removeCompany= function(req, res){
	  if(req.session.admin_flag){	
			var _id= ObjectID(req.body._id);
			mongo.connect(mongoURL,function(){
				var company = mongo.collection('companies');
				company.findOne({"_id":_id},function(err,result){
					if(err){
						console.log("Error in Removing company");
						res.end("Error in Removing company");
					}else{
						if(result){
							company.remove({"_id":_id});
							res.send({
								"status_code" : 200
							});
						}else{
							res.send({
								"status_code" : 400,
								"status_message" : "No Results Found"
							});					
						}
					}		
				});
			});	
	  }else{
	  	  res.end('Access Denied!')
	  }
};

exports.updateCompany= function(req, res){
	if(req.session.admin_flag){	
			var _id = req.body._id;
			var name = req.body.name;
			var num_employees = req.body.num_employees;
			var year_founded = req.body.year_founded;
			var contact_name = req.body.contact_name;
			var contact_email = req.body.contact_email;
			var rankings =  {
				financials: req.body.rankings.financials,
				team: req.body.rankings.team,
				idea: req.body.rankings.idea
			}
			var companyDetails = {
					name : name,
					num_employees: num_employees,
					year_founded: year_founded,
					contact_name: contact_name,
					contact_email: contact_email,
					rankings: {
						financials: rankings.financials,
						team: rankings.team,
						idea: rankings.idea
					}
			};	
			mongo.connect(mongoURL, function(){
		        console.log('Connected to mongo at: ' + mongoURL);
		        var company = mongo.collection('companies');
		        company.findOne({_id: ObjectID(_id)},function(err,result){
		    	   if(!err){
		    		   if(result !== null){
		    			   company.update({_id: ObjectID(_id)},{$set:companyDetails}, function(err1, result){
		   		        	if(!err1){
		   		        		res.send({
		   		                	"status_code" : 200
		   		                });
		   		        	}else{
		   		        		console.log("Error Occured while updating into DB");
		   		        		res.end('Error Occured while updating into DB');
		   		        	}
		   		        });
		    			      
		    		   }else{
		    			   console.log("Company Dosnt Exists");
		    			   res.send({
	   		                	"status_code" : 400,
	   		                	"status_message" : 'Company Dosnt Exits!'
	   		                });
		    		   }
		    	   }else{
		    		   res.end('An error occured while finding');
		    	   }
		    	   
		       });
			});
		
	}else{
		  res.end('Access Denied!')
	}
	
};

exports.retrieveCompany = function(req,res){
	var name=req.param('name');
	mongo.connect(mongoURL,function(){
		var users= mongo.collection('users');
		users.findOne({user_username:req.session.username, authenticate : "yes"},function(err,result){
			if(result !== null && req.session.user_flag ){
				var company=mongo.collection('companies');
				company.findOne({name:name},function(err,result){
					if(!err){
						if(result !== null){
							res.send({
								"status_code" : 200,
								"result":JSON.stringify(result)
							});
						}else{
							res.send({
								"status_code":400,
								"status_msg" : "Company Not Found"
								});
						}
				   }else{
						res.send({
							"status_message":'Error Occured while finding a company',
							"status_code":400,
						});
				   }
				});
			}else{
				console.log("Can't Access");
				res.send({
					"status_code":400,
					"status_msg" : "Acess Denied!"
					});
			}	
		});		
	});
};

exports.retrieveCompanies= function(req,res){
	var no_of_companies = Number(req.param('numberOfCompanies'));
	var category=req.param('category');
	mongo.connect(mongoURL,function(){
		var users= mongo.collection('users');
		users.findOne({user_username:req.session.username, authenticate : "yes"},function(err,result){
			if(result !== null && req.session.user_flag){
			
				var company= mongo.collection('companies');
				var query;
				switch(category){
					case 'team':
						query =company.find().sort({"rankings.team":-1});
						break;
					case 'financials':
						query =company.find().sort({"rankings.financials":-1});
						break;
					case 'idea':
						query =company.find().sort({"rankings.idea":-1});
						break;
				}		
				query.limit(no_of_companies).toArray(function(err,results){
					if(results !== null){
						res.send({
							"status_code" : 200,
							"companies" : JSON.stringify(results)
						});
					}else{
						res.send({
							"status_code":400,
							"status_msg" : "Companies Not Found"
							});
					}
				});
			}else{
				console.log("Can't Access");
				res.send({
					"status_code":400,
					"status_msg" : "Acess Denied!"
					});
			}	
		});
	});
};

