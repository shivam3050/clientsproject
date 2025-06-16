
import "./Student.css"
import StudentBody from "./StudentBody";
let isMenuAsideOn = false;

function MenuLoaderButton() {
  const elementAside = document.querySelector('.student-aside-pure');
  const elementAsideAverlay = document.querySelector('.student-aside-overlay');


  if (isMenuAsideOn) {
    // el.style.display = 'none';
    elementAside.style.left = '-25%';
    isMenuAsideOn = false;
    elementAsideAverlay.style.opacity = 0;
    //   el.children[1].style.opacity = 0;
  } else {
    // el.style.display = 'flex';
    //   elementAside.style.flexDirection = 'row';
    elementAside.style.left = '0px';
    elementAside.style.top = '0px';
    elementAside.style.zIndex = 2;
    //   elementAside.style.width = '25%';
    elementAsideAverlay.style.opacity = 0.4;
    elementAsideAverlay.style.zIndex = 1;
    //   el.children[1].style.opacity = 0.4;
    isMenuAsideOn = true;
  }

}









const Studentt = () => {
  return (<div className='student-homepage'>

    <div className="student-navbar">

      <div className="" onClick={MenuLoaderButton}>
        <button className="three-dot-button">
          <section></section>
          <section></section>
          <section></section>
        </button>
      </div>

      <div>
        <select className="studentpage-all-courses-selectbar">
          <option>Courses</option>
          <option>Important events of national and international importance.</option>
          <option>History of India and Indian National Movement.</option>
          <option>Indian and World Geography – Physical, Social and Economic Geography of India and the World.</option>
          <option>Indian Polity and Governance – Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues, etc.</option>
          <option>Economic and Social Development – Sustainable Development, Poverty, Inclusion, Demographics, Social Sector Initiatives, etc.</option>
          <option>Environmental Ecology, Biodiversity and Climate Change – General issues on these topics that do not require subject specialization.</option>
          <option>General Science.</option>
          <option>Comprehension</option>
          <option>Interpersonal skills including communication skills</option>
          <option>Logical reasoning and analytical ability</option>
          <option>Decision-making and problem-solving</option>
          <option>General mental ability</option>
          <option>Basic numeracy (numbers and their relations, orders of magnitude, etc. – Class 10 level), Data interpretation (charts, graphs, tables, data sufficiency, etc. – Class 10 level)</option>
        </select>
      </div>
      <div>

      </div>
      <div>
        <button className="studentpage-login-logout">Login</button>
      </div>

    </div>

    <section className='student-aside-pure'>
      <header>
        <button onClick={MenuLoaderButton}>Close</button>
      </header>
      <main>
        <ul>
          <li><a href="/admin" target="_blank" rel="noopener noreferrer" onClick={() => { MenuLoaderButton(); }}>Admin</a></li>
          <li>About</li>
        </ul>
      </main>
    </section>
    <section onClick={() => { MenuLoaderButton() }} className='student-aside-overlay'>
    </section>
    <main className="student-body">
      <StudentBody />
    </main>

  </div>)
}

export default Studentt;