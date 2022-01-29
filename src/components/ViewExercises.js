import React from "react";
import Loader from "./Loader";
import minutesToHours from "../utils/minutes-to-hours";

// A pop up that shows exercises of a user
export default props => {
    if(!props.exercises.showExercisesPopup) return null;
    if(props.exercises.exercisesLoading) {
      return (
        <div id="popup">
          <div className="content-container">
            <div className="content">
              <Loader />
              <p>
                <a class="link close-popup">Close</a>
              </p>
            </div>
          </div>
        </div>
      );
    }
    const exercises = [];
    if(props.exercises.exercises.log) {
      const log = props.exercises.exercises.log;
      for(let i = 0; i < log.length; i++) {
        exercises.push((
          <div className="exercise">
            <div className="exercise-details">
              <p>
                <strong>Date:</strong>
                {log[i].date}
              </p>
              <p>
                <strong>Description:</strong>
                {log[i].description}
              </p>
              <p>
                <strong>Duration:</strong>
                {minutesToHours(log[i].duration)}
              </p>
            </div>
          </div>
        ));
      }
    }
    return (
      <div id="popup">
        <div className="content-container">
          <div className="content exercises">
            <h3>Recent exercises by {props.exercises.exercises.username || ""}</h3>
            <div>
              { exercises }
            </div>
            <div>
              {
                props.exercises.exercisesError ? <p className="error">{props.exercises.exercisesError}</p> : ""
              }
            </div>
            <p style={{
                textAlign: "center"
              }}>
              <a class="link close-popup">Close</a>
            </p>
          </div>
        </div>
      </div>
    );
}