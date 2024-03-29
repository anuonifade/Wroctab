import React, { PropTypes } from 'react';
import toastr from 'toastr';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReduxSweetAlert, { swal, close } from 'react-redux-sweetalert';
import ReactPaginate from 'react-paginate';
import { addFlashMessage } from '../../actions/flashMessages';
import * as userActions from '../../actions/userActions';

class UserList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      id: 0,
      offset: 0,
      limit: 10
    };

    this.editUser = this.editUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.viewUser = this.viewUser.bind(this);
    this.renderAlert = this.renderAlert.bind(this);
    this.updateSelectState = this.updateSelectState.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
  }

  componentDidMount() {
    $('select').material_select();
    $('#mySelectBox').on('change', this.updateSelectState);
  }

  updateSelectState(event) {
    let limit = this.state.limit;
    limit = event.target.value;
    this.setState({ limit }, () => {
      this.props.actions.loadUsers(limit, this.state.offset);
    });
  }

  viewUser(event) {
    event.preventDefault();
    const userId = event.target.id;
    this.props.actions.setSelectedUser(userId);
    this.props.actions.displaySelectedUser(userId);
  }

  editUser(event) {
    event.preventDefault();
    const userId = event.target.id;
    this.props.actions.setSelectedUser(userId);
    this.props.actions.displaySelectedUser();
  }
  deleteUser() {
    const userId = this.state.id;
    this.props.actions.deleteUser(userId)
    .then(() => toastr.success('User Successfully Deleted'))
    .catch(() => {
      this.props.addFlashMessage({
        type: 'error',
        text: 'Unable to delete user' });
      toastr.error(
        'Unable to delete user');
    });
    this.setState({ id: 0 });
  }

  handlePageClick(data) {
    const selected = data.selected;
    const offset = Math.ceil(selected * this.state.limit);

    this.setState({ offset }, () => {
      this.props.actions.loadUsers(this.state.limit, offset);
    });
  }

  renderAlert(event) {
    e.ventpreventDefault();
    let id = this.state.id;
    id = event.target.id;
    this.setState({ show: true, id });
    this.props.swal({
      title: 'Warning!',
      text: 'Are you sure?',
      type: 'info',
      showCancelButton: true,
      onConfirm: this.deleteUser,
      onCancel: this.props.close,
    });
  }

  render() {
    return (
      <div>
      {this
        .props
        .allUsers
        .map(user => <div id="card-alert" className="card"
        key={user.id}>
          <div className="card-content teal-text transparent80">
            {user.name} - {user.email}
          </div>
          <div className="fixed-action-btn horizontal click-to-toggle edit">
            <a className="btn-floating teal tooltipped"
              data-position="top" data-delay="50"
              data-tooltip="click to view more"
              >
              <i className="material-icons">more_vert</i>
            </a>
            <ul>
            <li onClick={this.viewUser} className="editDoc">
              <a
              className="btn-floating teal tooltipped"
              data-position="bottom" data-delay="50"
              data-tooltip="edit document">
                <i id={user.id} className="material-icons">view_list</i>
              </a>
            </li>
              <li onClick={this.editUser} className="editDoc">
                <a
                className="btn-floating teal tooltipped"
                data-position="bottom" data-delay="50"
                data-tooltip="edit document">
                  <i id={user.id} className="material-icons">mode_edit</i>
                </a>
              </li>
              <li onClick={this.renderAlert}>
                <a className="btn-floating red accent-4 tooltipped"
                  data-position="bottom" data-delay="50"
                  data-tooltip="delete document">
                  <i id={user.id} className="material-icons">delete</i>
                </a>
              </li>
            </ul>
          </div>
        </div>)}
        <div className="row">
          <div className="col s7">
            <ReactPaginate previousLabel={'previous'}
                           nextLabel={'next'}
                           breakLabel={<a href="">...</a>}
                           breakClassName={'break-me'}
                           pageCount={this.props.pageCount}
                           marginPagesDisplayed={2}
                           pageRangeDisplayed={5}
                           onPageChange={this.handlePageClick}
                           containerClassName={'pagination'}
                           subContainerClassName={'pages pagination'}
                           pageClassName={'waves-effect'}
                           activeClassName={'active'} />
            <ReduxSweetAlert />
          </div>
          <div className="col s5">
            <select name="viewAccess" id="mySelectBox"
            value={this.state.limit}
            className="browser-default">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            Select number of users to be displayed
          </div>
        </div>
      </div>
    );
  }
}

UserList.propTypes = {
  actions: PropTypes.object.isRequired,
  allUsers: PropTypes.array.isRequired,
  swal: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  addFlashMessage: React.PropTypes.func.isRequired,
  pageCount: PropTypes.number
};

/**
 *
 * dispatch role actions
 * @param {any} dispatch
 * @returns {any}
 */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    swal: bindActionCreators(swal, dispatch),
    close: bindActionCreators(close, dispatch),
    addFlashMessage: bindActionCreators(addFlashMessage, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(UserList);
