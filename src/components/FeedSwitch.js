import React from "react";

// Switches feed between public exercises and user's exercises
export default props => {
    return (
        <div id="feed-switch">
            <a className={props.showUserExercises ? "button" : "button button-active"} onClick={() => {
                if(!props.showUserExercises) return;
                props.toggleFeed();
            }}>Feed</a>
            <a className={props.authorized ? props.showUserExercises ? "button button-active" : "button" : "button button-disabled"} onClick={() => {
                if(props.showUserExercises) return;
                props.toggleFeed();
            }}>Your exercises</a>
        </div>
    );
}