const Doctor = require("../modals/doctor");
const Doc_Review = require("../modals/doctor-reviews");


class review_controller {
    constructor() { }
    
    async addReview(req, res) {
        try {
            req.body.patient = req.user._id

            const checkReview = await Doc_Review.findOne({patient: req.user._id, doctor: req.body.doctor})
            if(checkReview && checkReview._id){
                return res.status(400).send({ success: false, data: {}, message: "You have already reviewed this doctor" });
            }

            const doctorData = await Doctor.findById(req.body.doctor);
            if (!doctorData) {
              return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            const saveReview = await Doc_Review.create(req.body)
            if(_.isEmpty(saveReview) || !saveReview._id){
                return res.status(400).send({ success: false, data: {}, message: "Review not created" });
            }else{
                const totalReviews = doctorData.total_rating + 1;
                const newAvgReview = ((doctorData.avg_rating * doctorData.total_rating) + req.body.rating) / totalReviews;
                doctorData.total_rating = totalReviews;
                doctorData.avg_rating = newAvgReview;
                await doctorData.save();
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