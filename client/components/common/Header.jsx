import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { logout } from '../../actions/userActions';
import SearchModal from '../search/SearchModal.jsx';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.handleSearchModal = this.handleSearchModal.bind(this);
  }

  logout(event) {
    event.preventDefault();
    this
      .props
      .logout();
  }

  handleSearchModal(event) {
    event.preventDefault();
    $('#modal2').modal('open');
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    const userLinks = (
      <ul>
        <li id="searchClick" activeClassName="active">
          <a
            onClick={this.handleSearchModal} className="tooltipped"
            data-position="left" data-delay="50"
            data-tooltip="search for documents"
            >
          <i className="material-icons">search</i></a>
        </li>
        <li activeClassName="active">
          <Link to="/profile" activeClassName="active">Hello, {
              isAuthenticated ? this.props.auth.user.data.name : 'Guest'
            }!</Link>
        </li>
        <li activeClassName="active">
          <Link to="/" activeClassName="active">
            <i className="material-icons left">dashboard</i>Dashboard</Link>
        </li>
        <li activeClassName="active" id="docClick">
          <Link to="/document" activeClassName="active">My Documents</Link>
        </li>
          {this.props.isAdmin ?
            <li className="admin" activeClassName="active">
              <Link to="/admin/manageroles" activeClassName="active">
                Manage Roles</Link>
            </li>
             : ''}
             {this.props.isAdmin ?
               <li className="admin" id="adminTab" activeClassName="active">
                 <Link to="/admin/manageusers" activeClassName="active">
                   Manage Users</Link>
               </li>
               : ''
             }
        <li>
          <a id="logout" href="#" onClick={this.logout}>Logout</a>
        </li>
      </ul>
    );

    const guestLinks = (
      <ul>
        <li activeClassName="active">
        </li>
      </ul>
    );
    return (
      <div>
      <nav className="teal darken-3 navbar-fixed">
        <div className="nav-wrapper">
          <div className="navheader">
            <Link to="/" className="brand-logo header-text black-color">
            WROCTAB</Link>
          </div>
          <a href="#" data-activates="mobile-demo" className="button-collapse">
            <i className="material-icons">menu</i>
          </a>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li>
              {isAuthenticated
                ? userLinks
                : guestLinks}
            </li>
          </ul>

        </div>
      </nav>
        <SearchModal/>
      </div>
    );
  }
}

Header.propTypes = {
  auth: React.PropTypes.object.isRequired,
  logout: React.PropTypes.func.isRequired,
  isAdmin: React.PropTypes.bool.isRequired
};

/**
 *
 *
 * @param {any} state
 * @returns {any} data
 */
function mapStateToProps(state) {
  let role;
  if (state.auth.isAuthenticated) {
    role = state.auth.user.data.roleId;
  }
  let isAdmin = false;
  if (role === 1) {
    isAdmin = true;
  }
  return { auth: state.auth, isAdmin };
}

export default connect(mapStateToProps, { logout })(Header);
