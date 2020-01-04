class TimersDashboard extends React.Component {
  state = {
     timers: [],
  }; 

  componentDidMount() {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 5000);
  }

  loadTimersFromServer = () => {
    client.getTimers((serverTimers) => {
      this.setState({timers: serverTimers});
    }); 
  }

  createTimer = (timer) => {
    const t = helpers.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(t)
    }); 

    client.createTimer(t);
  };

  updateTimer = (attrs) => {
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id == attrs.id) {
          return Object.assign({}, timer, attrs);
        } else {
          return timer; 
        } 
      }), 
    }); 

    client.updateTimer(attrs);
  };

  startTimer = (id) => {
    const now = Date.now();
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === id) {
          return Object.assign({}, timer, {runningSince: now}); 
        } else {
          return timer; 
        } 
      }),
    }); 

    client.startTimer({
      id: id,
      start: now,
    });
  }

  stopTimer = (id) => {
    const now = Date.now();
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === id) {
          const lastElapsed = now - timer.runningSince;
          return Object.assign({}, timer, {
            elapsed: timer.elapsed + lastElapsed,
            runningSince: null, 
          }); 
        } else {
          return timer; 
        } 
      }),
    }); 

    client.stopTimer({
      id: id,
      stop: now,
    });
  }

  handleFormSubmit = (timer) => {
    if (timer.id === undefined) {
      this.createTimer(timer);
    } else {
      this.updateTimer(timer);
    }
  };

  handleTrashClick = (id) => {
    this.setState({
       timers: this.state.timers.filter((timer) => timer.id !== id), 
    });  

    client.deleteTimer({id: id});
  };

  handleStartClick = (id) => {
    this.startTimer(id); 
  }

  handleStopClick = (id) => {
    this.stopTimer(id); 
  }

  render() {
    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <EditableTimerList
            timers={this.state.timers}
            onFormSubmit={this.handleFormSubmit}
            onTrashClick={this.handleTrashClick}
            onStopClick={this.handleStopClick}
            onStartClick={this.handleStartClick}
          />
          <ToggleableTimerForm
            onFormSubmit={this.handleFormSubmit}
          />
        </div>
      </div>
    );
  }
}

class EditableTimerList extends React.Component {
  render() {
    const timers = this.props.timers.map((timer) => (
      <EditableTimer
        key={timer.id}
        id={timer.id}
        title={timer.title}
        project={timer.project}
        elapsed={timer.elapsed}
        runningSince={timer.runningSince}
        onFormSubmit={this.props.onFormSubmit}
        onTrashClick={this.props.onTrashClick}
        onStopClick={this.props.onStopClick}
        onStartClick={this.props.onStartClick}
      />
    ));

    return (
      <div id='timers'>
        {timers}
      </div>
    );
  }
}

class EditableTimer extends React.Component {
  state = {
    editFormOpen: false, 
  };

  openForm = () => {
    this.setState({editFormOpen: true}); 
  };

  closeForm = () => {
    this.setState({editFormOpen: false}); 
  };

  handleEditClick = () => {
    this.openForm();
  };

  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer); 
    this.closeForm(); 
  };

  handleFormClose = () => {
    this.closeForm();
  };

  render() {
    if (this.state.editFormOpen) {
      return (
        <TimerForm
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          onFormSubmit={this.handleFormSubmit}
          onFormClose={this.handleFormClose}
          onStopClick={this.props.onStopClick}
          onStartClick={this.props.onStartClick}
        />
      );
    } else {
      return (
        <Timer
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onEditClick={this.handleEditClick}
          onTrashClick={this.props.onTrashClick}
          onStopClick={this.props.onStopClick}
          onStartClick={this.props.onStartClick}
        />
      );
    }
  }
}

class Timer extends React.Component {
  componentDidMount() {
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50); 
  }

  componentWillUnmount() {
    clearInterval(this.forceUpdateInterval); 
  }

  handleEditClick = () => {
    this.props.onEditClick(); 
  }

  handleTrashClick = () => {
    this.props.onTrashClick(this.props.id); 
  }

  handleStopClick = () => {
    this.props.onStopClick(this.props.id); 
  }

  handleStartClick = () => {
    this.props.onStartClick(this.props.id); 
  }

  render() {
    const elapsedString = helpers.renderElapsedString(
      this.props.elapsed, this.props.runningSince
    );

    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <div className='meta'>
            {this.props.project}
          </div>
          <div className='center aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span 
              className='right floated edit icon'
              onClick={this.handleEditClick}
            >
              <i className='edit icon' />
            </span>
            <span
              className='right floated trash icon'
              onClick={this.handleTrashClick}
            >
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <TimerActionButton
          timerIsRunning={!!this.props.runningSince}
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopClick}
        />
      </div>
    );
  }
}

class TimerActionButton extends React.Component {
  render() {
    if (this.props.timerIsRunning) {
      return (
        <div
          className='ui bottom attached red basic button'
          onClick={this.props.onStopClick}
        >
          Stop
        </div>
      );
    } else {
       return (
        <div
          className='ui bottom attached blue basic button'
          onClick={this.props.onStartClick}
        >
          Start
        </div>
      );   
    }
  }
}

class ToggleableTimerForm extends React.Component {
  state = {
    isOpen: false, 
  };

  handleFormOpen = () => {
    this.setState({isOpen: true}); 
  };

  handleFormClose = () => {
    this.setState({isOpen: false}); 
  };

  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer); 
    this.setState({isOpen: false}); 
  };

  render() {
    if (this.state.isOpen) {
      return (
        <TimerForm onFormSubmit={this.handleFormSubmit} onFormClose={this.handleFormClose}/>
      );
    } else {
      return (
        <div className='ui basic content center aligned segment'>
          <button
            className='ui basic button icon'
            onClick={this.handleFormOpen}
          >
            <i className='plus icon' />
          </button>
        </div>
      );
    }
  }
}

class TimerForm extends React.Component {
  state = {
    title: this.props.title || '', 
    project: this.props.project || '', 
  };

  handleTitleChange = (e) => {
    this.setState({title: e.target.value});
  };

  handleProjectChange = (e) => {
    this.setState({project: e.target.value});
  };

  handleSubmit = () => {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.state.title,
      project: this.state.project,
    }); 
  };

  render() {
    const submitText = this.props.id ? 'Update' : 'Create';
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input
                type='text'
                value={this.state.title}
                onChange={this.handleTitleChange}
              />
            </div>
            <div className='field'>
              <label>Project</label>
              <input
                type='text'
                value={this.state.project}
                onChange={this.handleProjectChange}
              />
            </div>
            <div className='ui two bottom attached buttons'>
              <button className='ui basic blue button' onClick={this.handleSubmit}>
                {submitText}
              </button>
              <button className='ui basic red button' onClick={this.props.onFormClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <TimersDashboard />,
  document.getElementById('content')
);
