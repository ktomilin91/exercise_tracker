import React from "react";
import Loader from "./Loader";
import minutesToHours from "../utils/minutes-to-hours";
import FeedSwitch from "./FeedSwitch";

// Shows Exercise feed and user's own exercises
export default props => {
  const exercises = props.feedProps.showUserExercises ? props.userExercises.userExercises.log || [] : props.feedProps.exerciseFeed;
  const arr = [];
  for(let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    arr.push((
      <div className="exercise">
          {
            props.feedProps.showUserExercises ? null : (
              <div className="exercise-heading">
                <h3>
                  <a className="link" onClick={() => props.fetchExercises(exercise._id)}>{exercise.username}</a> completed an exercise:
                </h3>
              </div>
            )
          }
          <div className="exercise-details">
            <p>
              <strong>Date:</strong>
              {exercise.date}
            </p>
            <p>
              <strong>Description:</strong>
              {exercise.description}
            </p>
            <p>
              <strong>Duration:</strong>
              {minutesToHours(exercise.duration)}
            </p>
          </div>
      </div>
    ));
  }
  return (
    <div className="content exercises">
      <FeedSwitch authorized={props.authorized} showUserExercises={props.feedProps.showUserExercises} toggleFeed={props.toggleFeed} />
      <div>{ arr }</div>
      { !arr.length && !props.feedProps.feedLoading && !props.userExercises.userExercisesLoading && !props.feedProps.feedError && !props.userExercises.userExercisesError ? <div className="load-button-container"><p>There's no exercises yet.</p></div> : null }
      { props.feedProps.feedLoading || props.userExercises.userExercisesLoading ? <div className="load-button-container"><Loader /></div> : null }
      { props.feedProps.feedError || props.userExercises.userExercisesError ? <div className="load-button-container"><p className="error">{props.feedProps.feedError || props.userExercises.userExercisesError}</p></div> : null }
      { !props.feedProps.showUserExercises && props.feedProps.showLoadFeedButton && !props.feedProps.feedLoading ? <div className="load-button-container"><a className="button" onClick={props.loadFeed}>Load more</a></div> : null }
    </div>
  );
}