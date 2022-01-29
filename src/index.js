import "./main.scss";

import React, {Component} from "react";
import ReactDOM from "react-dom";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import ViewExercises from "./components/ViewExercises";
import Greeting from "./components/Greeting";
import AuthorizationBanner from "./components/AuthorizationBanner";
import UploadExercise from "./components/UploadExercise";
import ExerciseFeed from "./components/ExerciseFeed";
import Footer from "./components/Footer";
import getCurrentDate from "./utils/get-current-date.js";
import sendRequest from "./utils/send-request";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authorization: {
        authorized: false,
        userId: "",
        username: "",
        token: "",
        processing: true
      },
      feedProps: {
        exerciseFeed: [],
        earliestFeedTime: Date.now(),
        showLoadFeedButton: false,
        feedLoading: false,
        showUserExercises: false,
        feedError: ""
      },
      signUp: {
        username: "",
        password: "",
        repeatPassword: "",
        private: false,
        processing: false,
        showSignUpPopup: false,
        signUpError: ""
      },
      logIn: {
        username: "",
        password: "",
        processing: false,
        showLogInPopup: false,
        logInError: ""
      },
      exercises: {
        exercises: {},
        exercisesError: "",
        exercisesLoading: false,
        showExercisesPopup: false
      },
      userExercises: {
        userExercises: {},
        userExercisesError: "",
        userExercisesLoading: false
      },
      newExercise: {
        description: "",
        durationH: "0",
        durationM: "0",
        date: getCurrentDate(),
        processing: false,
        success: false,
        newExerciseError: ""
      }
    };
    this.loadFeed = this.loadFeed.bind(this);
    this.toggleFeed = this.toggleFeed.bind(this);
    this.fetchExercises = this.fetchExercises.bind(this);
    this.showAuthorization = this.showAuthorization.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSignUpLogIn = this.handleSignUpLogIn.bind(this);
    this.handleExerciseUpload = this.handleExerciseUpload.bind(this);
    this.logBack = this.logBack.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  // Processes new exercise upload
  handleExerciseUpload() {
    if(!this.state.authorization.authorized) return;
    this.setState(prevState => ({
      newExercise: {
        ...prevState.newExercise,
        processing: true,
        success: false,
        newExerciseError: ""
      }
    }));
    // Validating the input
    if(!/^[A-Z0-9_?!@#$%^&*~,.:;()\[\]\s"'`\/]{2,60}$/i.test(this.state.newExercise.description)) return this.setState(prevState => ({
      newExercise: {
        ...prevState.newExercise,
        processing: false,
        newExerciseError: "Description field is required and may only contain letters, numbers and punctuation symbols and must be between 2-60 symbols long"
      }
    }));
    if(isNaN(Number(this.state.newExercise.durationH)) || isNaN(Number(this.state.newExercise.durationM)) ||isNaN(Date.parse(this.state.newExercise.date))) return this.setState(prevState => ({
      newExercise: {
        ...prevState.newExercise,
        processing: false,
        newExerciseError: "Invalid input"
      }
    }));
    const duration = (Number(this.state.newExercise.durationH) * 60) + Number(this.state.newExercise.durationM);
    if(!duration) return this.setState(prevState => ({
      newExercise: {
        ...prevState.newExercise,
        processing: false,
        newExerciseError: "You must input the exercise duration greater than zero"
      }
    }));
    // Sending the exercise to the server
    sendRequest({
      mode: "POST",
      url: "/api/users/" + this.state.authorization.userId + "/exercises",
      body: "description=" + encodeURIComponent(this.state.newExercise.description) + "&duration=" + encodeURIComponent(duration) + (this.state.newExercise.date === getCurrentDate() ? "" : "&date=" + encodeURIComponent(this.state.newExercise.date)) + "&_t=" + encodeURIComponent(this.state.authorization.token)
    }, (err, res) => {
      try {
        if(err) throw err; 
        const data = JSON.parse(res);
        if(data.error) return this.setState(prevState => ({
          newExercise: {
            ...prevState.newExercise,
            processing: false,
            newExerciseError: data.error
          }
        }));
        this.setState(prevState => ({
          newExercise: {
            description: "",
            durationH: "0",
            durationM: "0",
            date: getCurrentDate(),
            processing: false,
            success: true,
            newExerciseError: ""
          },
          userExercises: {
            ...prevState.userExercises,
            userExercises: (prevState.userExercises.userExercises.log ? {
              ...prevState.userExercises.userExercises,
              log: [{
                  description: data.description,
                  duration: data.duration,
                  date: data.date
                }, ...prevState.userExercises.userExercises.log]
            } : {
              _id: data._id,
              username: data.username,
              count: 1,
              log: [{
                description: data.description,
                duration: data.duration,
                date: data.date
              }]
            })
          },
          feedProps: {
            ...prevState.feedProps,
            exerciseFeed: [{
                description: data.description,
                duration: data.duration,
                date: data.date,
                username: data.username,
                _id: data._id
              }, ...prevState.feedProps.exerciseFeed]
          }
        }));
      } catch(err) {
        this.setState(prevState => ({
          newExercise: {
            ...prevState.newExercise,
            processing: false,
            newExerciseError: "There was an error while processing your request, please try again"
          }
        }));
      }
    });
  }

  // Switches between exercise feed and a list of user's exercises
  toggleFeed() {
    if(!this.state.authorization.authorized) return;
    this.setState(prevState => ({
      feedProps: {
        ...prevState.feedProps,
        showUserExercises: !prevState.feedProps.showUserExercises
      }
    }));
  }

  // Attempts to log the user back based on credentials saved in Local Storage
  logBack() {
    try {
      const userId = window.localStorage.getItem("userId");
      const token = window.localStorage.getItem("token");
      if(!userId || !token) return this.setState(prevState => ({
        authorization: {
          ...prevState.authorization,
          processing: false
        }
      }));
      sendRequest({
        mode: "POST",
        url: "/api/login",
        body: "_id=" + encodeURIComponent(userId) + "&_t=" + encodeURIComponent(token)
      }, (err, res) => {
        if(err) throw err;
        const data = JSON.parse(res);
        if(data.error) return this.logOut();
        this.setState({
          authorization: {
            authorized: data._id ? true : false,
            userId: data._id || "",
            username: data.username || "",
            token: data._t || "",
            processing: false
          }
        });
        if(data._id) this.fetchExercises(data._id, "userExercises");
      });
    } catch(err) {
      console.error(err);
      this.logOut();
    }
  }

  // Handles sign up or log in  actions
  handleSignUpLogIn(objectName) {
    // Clear previous error message and show the loader
    this.setState(prevState => ({
      [objectName]: {
        ...prevState[objectName],
        processing: true,
        [objectName + "Error"]: ""
      }
    }));
    // Validate inputs
    if(!this.state[objectName].username || !this.state[objectName].password || (objectName === "signUp" && !this.state.signUp.repeatPassword)) {
      return this.setState(prevState => ({
        [objectName]: {
          ...prevState[objectName],
          processing: false,
          [objectName + "Error"]: "You must fill out all fields"
        }
      }));
    }
    // Validate Username
    if(!/^[A-Z0-9_]{3,30}$/i.test(this.state[objectName].username)) {
      return this.setState(prevState => ({
        [objectName]: {
          ...prevState[objectName],
          processing: false,
          [objectName + "Error"]: "Login may only contain letters, numbers and the underscore symbols and must be between 3-30 symbols long"
        }
      }));
    }
    // Validate Password
    if(objectName === "signUp" && this.state.signUp.password !== this.state.signUp.repeatPassword) {
      return this.setState(prevState => ({
        signUp: {
          ...prevState.signUp,
          processing: false,
          signUpError: "You should enter the same password both times"
        }
      }));
    }
    if(!/^[A-Z0-9_?!@#$%^&*~]{3,30}$/i.test(this.state[objectName].password)) {
      return this.setState(prevState => ({
        [objectName]: {
          ...prevState[objectName],
          processing: false,
          [objectName + "Error"]: "Password may only contain letters, numbers and \"_\", \"?\", \"!\", \"@\", \"#\", \"$\", \"%\", \"^\", \"&\", \"*\", \"~\" symbols and must be between 3-30 symbols long"
        }
      }));
    }
    // Requesting new user
    sendRequest({
      mode: "POST",
      url: objectName === "signUp" ? "/api/users" : "/api/login",
      body: "username=" + encodeURIComponent(this.state[objectName].username) + "&password=" + encodeURIComponent(this.state[objectName].password) + (objectName === "signUp" ? "&private=" + encodeURIComponent(this.state.signUp.private) : "")
    }, (err, res) => {
      // Handling errors
      if(err) {
        return this.setState(prevState => ({
          [objectName]: {
            ...prevState[objectName],
            processing: false,
            [objectName + "Error"]: "There was an error while processing your request, please try again"
          }
        }));
      }
      try {
        const data = JSON.parse(res);
        if(data.error) {
          return this.setState(prevState => ({
            [objectName]: {
              ...prevState[objectName],
              processing: false,
              [objectName + "Error"]: data.error
            }
          }));
        }
        this.setState({
          authorization: {
            authorized: data._id ? true : false,
            userId: data._id,
            username: data.username,
            token: data._t,
            processing: false
          }
        });
        this.closePopup();
        this.fetchExercises(data._id, "userExercises");
        // Saving the credentials to the local storage
        try {
          window.localStorage.setItem("userId", data._id);
          window.localStorage.setItem("token", data._t);
        } catch(storageErr) {
          console.error(storageErr);
        }
      } catch(err) {
        return this.setState(prevState => ({
          [objectName]: {
            ...prevState[objectName],
            processing: false,
            [objectName + "Error"]: "There was an error while processing your request, please try again"
          }
        }));
      }
    });
  }

  // Handles user input in forms
  handleInput(objectName, key, event, checkbox = false) {
    const value = checkbox ? event.target.checked : event.target.value;
    this.setState(prevState => ({
      [objectName]: {
        ...prevState[objectName],
        [key]: value,
        [objectName + "Error"]: ""
      }
    }));
    if(objectName === "newExercise") this.setState(prevState => ({
      newExercise: {
        ...prevState.newExercise,
        success: false
      }
    }));
  }
  
  // Exercise feed loader
  loadFeed() {
    const limit = 10;
    this.setState(prevState => ({
      feedProps: {
        ...prevState.feedProps,
        feedLoading: true
      }
    }));
    sendRequest({
      mode: "GET",
      url: "/api/exercises?limit=" + limit + "&lt=" + this.state.feedProps.earliestFeedTime
    }, (err, res) => {
      try {
        if(err) throw err;
        const response = JSON.parse(res);
        if(response.length) {
          return this.setState(prevState => ({
            feedProps: {
              exerciseFeed: [...prevState.feedProps.exerciseFeed, ...response],
              earliestFeedTime: response[response.length - 1]._timestamp,
              showLoadFeedButton: response.length === limit,
              feedLoading: false
            }
          }));
        }
        return this.setState(prevState => ({
          feedProps: {
            ...prevState.feedProps,
            showLoadFeedButton: false,
            feedLoading: false
          }
        }));
      } catch(err) {
        this.setState(prevState => ({
          feedProps: {
            ...prevState.feedProps,
            feedError: "There was an error while loading the Feed"
          }
        }));
      }
    });
  }

  // Fetches exercise records for a user
  fetchExercises(id, objectName = "exercises") {
    const limit = 100;
    // Opening the pop up screen if we fetch exercises of another user
    if(objectName === "exercises") {
      this.setState(prevState => ({
        exercises: {
          ...prevState.exercises,
          showExercisesPopup: true
        }
      }));
    }
    this.setState(prevState => ({
      [objectName]: {
        ...prevState[objectName],
        [objectName + "Loading"]: true
      }
    }));
    sendRequest({
      mode: "GET",
      url: "/api/users/" + id + "/logs?limit=" + limit
    }, (err, res) => {
      try {
        if(err) throw err;
        const response = JSON.parse(res);
        if(response.error) return this.setState(prevState => ({
          [objectName]: {
            ...prevState[objectName],
            [objectName + "Error"]: response.error,
            [objectName + "Loading"]: false
          }
        }));
        this.setState(prevState => ({
          [objectName]: {
            ...prevState[objectName],
            [objectName]: response,
            [objectName + "Loading"]: false
          }
        }));
      } catch(err) {
        this.setState(prevState => ({
          [objectName]: {
            ...prevState[objectName],
            [objectName + "Error"]: "There was an error while processing your request, please try again",
            [objectName + "Loading"]: false
          }
        }));
      }
    });
  }

  // Shows sign up or log in forms
  showAuthorization(objectName, key) {
    this.setState(prevState => ({
      [objectName]: {
        ...prevState[objectName],
        [key]: true
      }
    }));
  }

  // Closes pop up screen
  closePopup() {
    this.setState({
      signUp: {
        username: "",
        password: "",
        repeatPassword: "",
        private: false,
        processing: false,
        showSignUpPopup: false,
        signUpError: ""
      },
      logIn: {
        username: "",
        password: "",
        processing: false,
        showLogInPopup: false,
        logInError: ""
      },
      exercises: {
        exercises: {},
        exercisesError: "",
        exercisesLoading: false,
        showExercisesPopup: false
      }
    });
  }

  // Loggs user out
  logOut() {
    try {
      window.localStorage.removeItem("userId");
      window.localStorage.removeItem("token");
    } catch(err) {
      console.error(err);
    }
    this.setState(prevState => ({
      authorization: {
        authorized: false,
        userId: "",
        username: "",
        token: "",
        processing: false
      },
      feedProps: {
        ...prevState.feedProps,
        showUserExercises: false
      },
      userExercises: {
        userExercises: {},
        userExercisesError: "",
        userExercisesLoading: false
      },
      newExercise: {
        description: "",
        durationH: "0",
        durationM: "0",
        date: getCurrentDate(),
        processing: false,
        success: false,
        newExerciseError: ""
      }
    }));
  }

  // Loads Exercise feed, tries to log back the user and adds pop up close event
  componentDidMount() {
    this.loadFeed();
    window.addEventListener("click", event => {
      if(event.target.id === "popup" || (event.target.parentElement && event.target.parentElement.id === "popup") || event.target.classList.contains("close-popup")) this.closePopup();
    });
    this.logBack();
  }

  render() {
    return (
      <div>
        <SignUp signUp={this.state.signUp} handleInput={this.handleInput} handleSignUpLogIn={this.handleSignUpLogIn} />
        <LogIn logIn={this.state.logIn} handleInput={this.handleInput} handleSignUpLogIn={this.handleSignUpLogIn} />
        <ViewExercises exercises={this.state.exercises} />
        <div id="container">
          <div className="content-container">
            <Greeting username={this.state.authorization.username} logOut={this.logOut} />
            <AuthorizationBanner authorized={this.state.authorization.authorized} processing={this.state.authorization.processing} showAuthorization={this.showAuthorization} />
            <UploadExercise authorized={this.state.authorization.authorized} newExercise={this.state.newExercise} handleInput={this.handleInput} handleExerciseUpload={this.handleExerciseUpload} />
            <ExerciseFeed feedProps={this.state.feedProps} userExercises={this.state.userExercises} authorized={this.state.authorization.authorized} loadFeed={this.loadFeed} fetchExercises={this.fetchExercises} toggleFeed={this.toggleFeed} />
            <Footer />
          </div>
        </div>
      </div>
    );
  }
}

// Rendering App to the DOM
ReactDOM.render(<App />, document.getElementById("root"));