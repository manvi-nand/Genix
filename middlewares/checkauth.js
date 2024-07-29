module.exports.checkAuth = async(req,res,next)=>{
    // if the user_id property is set in the session
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    next();
}