import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { exampleProjects } from '../siteContent';

const filterOptions = [
  ['all', 'Semua'],
  ['branding', 'Branding'],
  ['digital', 'Web & UI/UX'],
  ['video', 'Video'],
  ['content', 'Konten'],
];

export default function WorkGallery() {
  const [filter, setFilter] = useState('all');
  const [project, setProject] = useState(exampleProjects[0]);
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);

  useEffect(function listenForDialogClose() {
    const dialogElement = dialogRef.current;

    function handleClose() {
      setIsOpen(false);
    }

    dialogElement.addEventListener('close', handleClose);

    return function removeCloseListener() {
      dialogElement.removeEventListener('close', handleClose);
    };
  }, []);

  useEffect(
    function lockBodyScroll() {
      if (!isOpen) {
        return;
      }
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return function restoreBodyScroll() {
        document.body.style.overflow = previousOverflow;
      };
    },
    [isOpen],
  );

  function openProject(item) {
    setProject(item);
    setIsOpen(true);
    dialogRef.current.showModal();
  }

  function closeDialog() {
    dialogRef.current.close();
  }

  function handleDialogClick(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const outsideHorizontally = event.clientX < bounds.left || event.clientX > bounds.right;
    const outsideVertically = event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outsideHorizontally || outsideVertically) {
      closeDialog();
    }
  }

  const filterButtons = filterOptions.map(function renderFilter(option) {
    const id = option[0];
    const name = option[1];

    let buttonClass = 'filter ';
    if (filter === id) {
      buttonClass = 'filter active';
    }

    function handleClick() {
      setFilter(id);
    }

    return (
      <button
        key={id}
        type="button"
        className={buttonClass}
        aria-pressed={filter === id}
        onClick={handleClick}
      >
        {name}
      </button>
    );
  });

  const projectCards = exampleProjects.map(function renderProject(item, index) {
    const isHidden = filter !== 'all' && filter !== item.category;

    function handleOpen() {
      openProject(item);
    }

    return (
      <article key={item.id} className="project col-md-6" hidden={isHidden}>
        <button
          type="button"
          className="project-image"
          onClick={handleOpen}
          aria-label={'Lihat konsep ' + item.title}
        >
          <img src={item.image} alt={item.alt} width="1280" height="853" loading="lazy" />
          <span className="project-tag">{item.kind}</span>
          <span className="project-open" aria-hidden="true">
            ↗
          </span>
        </button>
        <div className="project-caption">
          <div>
            <h3>{item.title}</h3>
            <p>{item.caption}</p>
          </div>
          <span>0{index + 1} / 06</span>
        </div>
      </article>
    );
  });

  return (
    <>
      <section className="work paper" id="karya" aria-labelledby="work-title">
        <div className="container">
          <div className="section-top">
            <div>
              <p className="eyebrow dark-eyebrow">SEDIKIT INSPIRASI UNTUK IDE BERIKUTNYA</p>
              <h2 id="work-title">
                Skill nyata. <em>Karya keren.</em>
              </h2>
            </div>
            <Link className="outline-link" to="/katalog">
              Jelajahi semua jasa ↗
            </Link>
          </div>
          <div className="work-toolbar">
            <p>Bayangkan apa yang bisa kita buat bersama.</p>
            <div className="work-filters" role="group" aria-label="Filter contoh karya">
              {filterButtons}
            </div>
          </div>
          <div className="work-grid row g-4 gy-5" aria-live="polite">
            {projectCards}
          </div>
          <p className="demo-note">
            Konsep visual untuk eksplorasi desain SewaSkill. Bukan portofolio atau proyek klien
            sebenarnya.
          </p>
        </div>
      </section>
      <dialog
        className="project-dialog"
        ref={dialogRef}
        aria-labelledby="project-modal-title"
        onClick={handleDialogClick}
      >
        <button
          type="button"
          className="dialog-close"
          aria-label="Tutup detail karya"
          onClick={closeDialog}
        >
          ×
        </button>
        <img src={project.image} alt={project.alt} />
        <div className="dialog-copy">
          <p className="eyebrow">KONSEP PORTOFOLIO</p>
          <h2 id="project-modal-title">{project.title}</h2>
          <p>
            {project.caption}. Temukan talent dengan keahlian serupa dan ceritakan kebutuhan
            proyekmu.
          </p>
          <Link className="button button-blue" to="/katalog">
            Cari skill serupa ↗
          </Link>
          <p className="demo-note">Ilustrasi konsep, bukan proyek klien sebenarnya.</p>
        </div>
      </dialog>
    </>
  );
}
