const helpandSupport = require("../Model/helpandSupportModel");



exports.AddQuery = async(req,res) => {
    try{
        const data = {
            user: req.user._id,
            name: req.body.name, 
            // email: req.body.email,
            phone: req.body.phone,
            query: req.body.query
        }
    const Data = await helpandSupport.create(data);
    res.status(200).json({
        message:Data
    })
    }catch(err){
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}



exports.getAllHelpandSupport = async (req, res) => {
console.log("hi");
    try {
      // Use the `populate` method to populate the `user` field
      const helpRequests = await helpandSupport.find().populate('user');
  console.log(helpRequests);
      res.status(200).json({ success: true, data: helpRequests });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };

  




exports.getAllHelpandSupportgetByuserId = async (req, res) => {
    
    try{
    const data = await helpandSupport.find({user: req.user._id});
    res.status(200).json({
        message: data
    })
    }catch(err){
        console.log(err);
        res.status(200).json({
            message: err.message
        })
    }
}

exports.DeleteHelpandSupport = async(req,res) => {
    try{
    await helpandSupport.deleteOne({userId: req.params.id})
    res.status(200).json({
        message: "Deleted"
    })
    }catch(err){
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}


