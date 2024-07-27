const Doc_Review = require("../modals/doctor-reviews");


class review_controller {
    constructor() { }
    
    async addReview(req, res) {
        try {
            req.body.patient = req.user._id
            const saveReview = await Doc_Review.create(req.body)
            if(_.isEmpty(saveReview) || !saveReview._id){
                return res.status(400).send({ success: false, data: {}, message: "Review not created" });
            }else{
                return res.status(200).send({ success: true, data: saveReview, message: "Review created successfully" });
            }
        } catch (error) {
            res.status(500).send({ success: false, data: {}, message: error.message });
        }
    }

    async update_review(req, res){
        try {
            const updatedReview = await Doc_Review.findByIdAndUpdate(req.params.id, req.body, {$new: true});
            if(_.isEmpty(updatedReview) || !updatedReview._id){
                return res.status(400).send({ success: false, data: {}, message: "Review not updated" });
            }else{
                return res.status(200).send({ success: true, data: updatedReview, message: "Review updated successfully" });
            }
        } catch (error) {
            res.status(500).send({ success: false, data: {}, message: error.message });
        }
    }

    async delete_review(req, res){
        try {
            const deletedReview = await Doc_Review.findByIdAndDelete(req.params.id);
            if(_.isEmpty(deletedReview) ||!deletedReview._id){
                return res.status(400).send({ success: false, data: {}, message: "Review not found" });
            }else{
                return res.status(200).send({ success: true, data: deletedReview, message: "Review deleted successfully" });
            }
        } catch (error) {
            res.status(500).send({ success: false, data: {}, message: error.message });
        }
    }
}

module.exports = new review_controller();