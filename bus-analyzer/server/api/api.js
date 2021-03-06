import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Stop from '../models/stop';
import Bus from '../models/bus';
const apiRoutes = express.Router();
apiRoutes.use(bodyParser.json());
apiRoutes.use(bodyParser.urlencoded({ extended: true }))

const convertArrivals = (arrivals) => {
	for(var i = 0; i < arrivals.length; i++) {
		arrivals[i].time = new Date(arrivals[i].time)
	}

};
apiRoutes.use(cors());

apiRoutes.post('/post/:num', (req, res) => {
	console.log('Initializing bus', req.params.num);
	let stopList = req.body.stopList;
	Stop.find({ busNum: req.params.num }, (err, stops) => {
		if(stops.length > 0) {
			console.log('Bus num already exists.')
			res.json({ success: true });
			return;
		}
		else {
			const bus = new Bus({ busNum: req.params.num });
			bus.save((err) => {
				if(err) throw err;
			})
			for(var i = 0; i < stopList.length; i++) {
				convertArrivals(stopList[i].arrivals);
				const stop = new Stop({
					busNum: req.params.num,
					stopName: stopList[i].stopName,
					arrivals: stopList[i].arrivals
				});
				stop.save((err) => {
					if(err) throw err;
				})	
			}
			res.json({ success: true });
			console.log('Initialized.');
		}
	})
	
	// res.json({ success: true });
})

apiRoutes.put('/update/:num', (req, res) => {
	console.log('Updating bus', req.params.num);
	let stopList = req.body.stopList;
	for(var i = 0; i < stopList.length; i++) {
		convertArrivals(stopList[i].arrivals) //now arrivals is just one-length list
		if(stopList[i].arrivals && stopList[i].arrivals.length === 1 && stopList[i].arrivals[0].interval !== -1 
			&& stopList[i].arrivals[0].interval < 100) {
			console.log('Updating', stopList[i].stopName);
			Stop.findOneAndUpdate(
				{ busNum: req.params.num, stopName: stopList[i].stopName },//conditions
				{ $push: { arrivals: stopList[i].arrivals[0] } }, // doc
				(err) => {
					if(err) throw err;
				}
			)
		}
		
	}
	console.log('Updated.')
	res.json({ success: true });
})

apiRoutes.get('/buses', (req, res) => {
	Bus.find({}, (err, buses) => {
		if(err) throw err;
		res.status(200).json(buses);
	})
})

apiRoutes.get('/:num', (req, res) => {
	Stop.find({ busNum: req.params.num }, (err, stops) => {
		if(err) throw err;
		res.status(200).json(stops);
	})
})

apiRoutes.get('/:num/:stopName', (req, res) => {
	console.log('GET request.');
	console.log(req.params.num, req.params.stopName);
	Stop.find({ busNum: req.params.num, stopName: req.params.stopName }, (err, stop) => {
		if(err) throw err;
		res.json(stop);
	})
})
// apiRoutes.delete('/delete', (req, res) => {
// 	Stop.deleteMany({}, () => {console.log('All deleted.')})
// 	res.json({ success: true })
// })
export default apiRoutes;