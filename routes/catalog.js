var express = require('express');
var router = express.Router();

// Require controller modules

var plane_controller = require('../controllers/planesController');



/// PLANE ROUTES ///

/* GET catalog home page. */
router.get('/', plane_controller.index);

/* GET request for creating Plane. NOTE This must come before route for id (i.e. display plane) */
router.get('/planes/create', plane_controller.plane_create_get);

/* POST request for creating Plane. */
router.post('/planes/create', plane_controller.plane_create_post);

/* GET request to delete Plane. */
router.get('/planes/:id/delete', plane_controller.plane_delete_get);

// POST request to delete Plane
router.post('/planes/:id/delete', plane_controller.plane_delete_post);

/* GET request for one Plane. */
router.get('/planes/:id', plane_controller.plane_detail);

/* GET request for list of all Planes. */
router.get('/planes', plane_controller.plane_list);




module.exports = router;
