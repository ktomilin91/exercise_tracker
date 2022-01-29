import React from "react";
import Loader from "./Loader";

// A form for upoading an exercise
export default props => {
    if(!props.authorized) return null;
    // Populating the hours and minutes selectors
    const hoursOptions = [];
    for(let i = 0; i < 24; i++) {
      hoursOptions.push((
        <option value={i}>{i}h</option>
      ));
    }
    const minutesOptions = [];
    for(let i = 0; i < 60; i++) {
      minutesOptions.push((
        <option value={i}>{i}m</option>
      ));
    }
    return (
      <div className="content">
        <div id="upload-exercise">
          <h2>Upload a new exercise</h2>
          <form>
            <div>
              <label for="description">Type of exercise:</label>
              <input type="text" name="description" required
      minlength="2" maxlength="60" value={props.newExercise.description} onChange={event => props.handleInput("newExercise", "description", event)} />
            </div>
            <div>
              <label for="duration-h">Duration:</label>
              <select name="duration-h" value={props.newExercise.durationH} onChange={event => props.handleInput("newExercise", "durationH", event)}>
                {hoursOptions}
              </select>
              <select name="duration-m" value={props.newExercise.durationM} onChange={event => props.handleInput("newExercise", "durationM", event)}>
                {minutesOptions}
              </select>
            </div>
            <div>
              <label for="date">Date of the exercise:</label>
              <input type="date" value={props.newExercise.date} onChange={event => props.handleInput("newExercise", "date", event)} />
            </div>
            {props.newExercise.newExerciseError ? <div><p className="error">{props.newExercise.newExerciseError}</p></div> : null}
            {props.newExercise.processing ? <Loader /> : null}
            {props.newExercise.processing ? null : (<div>
              <input className="action-button" type="submit" value="Submit" onClick={event => {
                event.preventDefault();
                props.handleExerciseUpload();
                }} />
            </div>)}
            {props.newExercise.success ? <div><p className="success">Your exercise has been successfully uploaded!</p></div> : null}
          </form>
        </div>
      </div>
    );
}