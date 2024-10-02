const express = require('express');
const app = express();
app.use(express.json())
const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

function checkAlerts(params) {
    console.log("Method Checkalerts entered");
    const username = params.username;
    const user = users.find(user => user.name === username);
    if (!user) {
        throw error;
    }
    return { alerts: user.alerts };
}

function createWorkout(params) {
    console.log("Method createWorkout entered");
    const username = params.username;
    const user = users.find(user => user.name === username);
    if (!user) {
        throw error;
    }

    if (user.workoutList.find(title => title.title === params.title)){
        throw error;
    }
    // new workout
    const workoutAdd = {
        category: params.category, title: params.title, instruction: params.instruction, repetitions: params.repetitions, completed: false
    };
    user.workoutList.push(workoutAdd);
    return { workout: workoutAdd };
}

function completeWorkout(params) {
    console.log("Method completeWorkout entered");
    const username = params.username;
    const user = users.find(user => user.name === username);
    if (!user) {
        throw error;
    }
    const workout = user.workoutList.find(title => title.title == params.title);
    if (!workout) {
        throw error;
    }
    workout.completed = true;
    return { workout: workout };
}

function checkHealthStats(params) {
    console.log("Method checkHealthStats entered");
    const username = params.username;
    const user = users.find(user => user.name === username);
    if (!user) {
        throw error;
    }
    return { healthStats: user.healthStats };
}

app.post('/', (req, res) => {

    // invalid json check
    if (!req.body) {
        res.status(400).json({
            "jsonrpc": "2.0",
            "error": {
                "code": -32700,
                "message": "Parse error"
            },
            "id": null
        });
        return;
    }

    // Batch request
    if (Array.isArray(req.body)) {
        const batchResponses = req.body.map((requests) => {
            const { jsonrpc, id, method, params } = requests;

            try {
                let result;

                if (!requests) {

                    return { "jsonrpc": "2.0", error: { "code": -32700, "message": "Parse error" }, id: null };
                }

                // invalid request check
                if (!jsonrpc || "2.0".localeCompare(jsonrpc) || !method || typeof method != "string") {
                    return { "jsonrpc": "2.0", error: { "code": -32600, "message": "Invalid Request" }, id: null }
                }

                switch (method) {
                    case "checkAlerts": 
                        result = checkAlerts(params);
                        break;

                    case "createWorkout":
                        result = createWorkout(params);
                        break;

                    case "completeWorkout":
                        result = completeWorkout(params);
                        break;

                    case "checkHealthStats":
                        result = checkHealthStats(params);
                        break;
                    default:
                        return { "jsonrpc": "2.0", error: { "code": -32601, "message": "Method not found" }, id: null }
                }
                return { jsonrpc, result, id };
            } catch (error) {
                return { "jsonrpc": "2.0", error: { "code": -32602, "message": "Invalid params" }, id: null }
            }


        });

        // filter requests
        const filteredResponses = batchResponses.filter(response => response !== null);
        res.status(200).json(filteredResponses);
        return;
    }


    // normal requests    
    // invalid request check
    if (!req.body.jsonrpc || "2.0".localeCompare(req.body.jsonrpc) || !req.body.method || typeof req.body.method != "string") {
        res.status(400).json({
            "jsonrpc": "2.0",
            "error": {
                "code": -32600,
                "message": "Invalid Request"
            },
            "id": null
        });
        return;
    }

    // no response after notification
    if (!req.body.id) {
        return;
    }

    try {
        switch (req.body.method) {
            case "checkAlerts":
                result = checkAlerts(req.body.params);
                break;

            case "createWorkout":
                result = createWorkout(req.body.params);
                break;

            case "completeWorkout":
                result = completeWorkout(req.body.params);
                break;

            case "checkHealthStats":
                result = checkHealthStats(req.body.params);
                break;
            default:
                res.status(400).json({
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32601,
                        "message": "Method not found"
                    },
                    "id": null
                });
                return;
        }
    }
    catch (error) {
        res.status(400).json({
            "jsonrpc": "2.0",
            "error": {
                "code": -32602,
                "message": "Invalid params"
            },
            "id": null
        });
        return;
    }

    res.status(200).json({
        "jsonrpc": "2.0",
        "result": result,
        "id": req.body.id
    })
});


// Datas
// Alerts data
const alerts = {
    stepCount: {message: "Step count reached" , dateTime : new Date(222222222222).toString() },
    dayTip: {message: "Tip of the day",  dateTime : new Date(999999999999).toString() },
    functions: {message: "New functions ", dateTime : new Date(777777777777).toString() }
}
let alertsListBob = [alerts.stepCount, alerts.dayTip];
let alertsListAlice = [alerts.functions, alerts.dayTip];

// Workout data
let workouts = {
    squads: {
        category: "legs", title: "Squads", instruction: "Start with....", repetitions: 40, completed: false
    },
    bicepCurls: {
        category: "bicep", title: "Bicep Curls", instruction: "Start with....", repetitions: 10, completed: false
    },
    pushUps: {
        category: "breast", title: "Push ups", instruction: "Start with....",  repetitions: 30, completed: true
    }
};
let workoutsBob = [workouts.squads, workouts.bicepCurls];
let workoutsAlice = [workouts.squads, workouts.pushUps];

// Health stats
const healthStats = {
    Bob: { stepsPerDay: 40000, calories: 2000, workoutsCompleted: 20, trainingHours: 12 },
    Alice: { stepsPerDay: 5000, calories: 500, workoutsCompleted: 1, trainingHours: 2 }
};

// users
const users = [
    { name: "Bob", alerts: alertsListBob, workoutList: workoutsBob, healthStats: healthStats.Bob },
    { name: "Alice", alerts: alertsListAlice, workoutList: workoutsAlice, healthStats: healthStats.Alice }
];