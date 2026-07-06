import basePath from './../../helpers/BasePath';
import ButtonAnchor from './../general/ButtonAnchor.jsx';
import ButtonShare from './../general/ButtonShare.jsx';

import './Header.css';

function Header({ bg_image_url, chapters, full_report_url, overview_url, subtitle, title, year, url }) {
  const bgSrc = bg_image_url?.startsWith('http') ? bg_image_url : `${basePath()}${bg_image_url}`;
  const scrollTo = selector => window.appRef.current.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="container_header_wrapper" style={{ backgroundImage: `url(${bgSrc})` }}>
      <div className="container_header">
        <div className="header_top">
          <h2>
            <div className="name">{title}</div>
            <div className="year">{year}</div>
          </h2>
        </div>
        <div className="header_bottom">
          <h3>
            <div>{subtitle}</div>
            <ButtonShare url={url} defaultOpen position="static" iconBg="rgba(0,0,0,0.45)" iconColor="#fff" size={36} />
          </h3>
          <div className="download_buttons_container">
            <ButtonAnchor className="overview" url={overview_url} text="Overview" />
            <ButtonAnchor className="full_report" url={full_report_url} text="Full report" />
            <ButtonAnchor url={'.anchor_videos'} text="Videos" />
            <ButtonAnchor url={'.anchor_podcasts'} text="Podcasts" />
            <ButtonAnchor url={'.anchor_press'} text="Press" />
            <ButtonAnchor url="https://unctad.org/topic/investment/world-investment-report" text="Regional data" />
            <ButtonAnchor url={'.anchor_fdi_explorer'} text="FDI Explorer" />
          </div>
          <div className="container_chapters_navigation">
            {chapters.map((chapter, i) => (
              <button onClick={() => scrollTo(`.container_chapter_${i + 1}`)} type="button" key={chapter.title}>
                <div className="chapter_navigation">
                  <div className="chapter_title">
                    <h3>{chapter.title}</h3>
                  </div>
                  <div className="chapter_image">
                    <div style={{ backgroundImage: `url(${chapter.image_url?.startsWith('http') ? chapter.image_url : `${basePath()}${chapter.image_url}`})` }} />
                  </div>
                  <div className="chapter_meta">
                    <div className="chapter_number">{i + 1}.</div>
                    {chapter.pdf_url && (
                      <a href={chapter.pdf_url} target="_blank" className="chapter_download_button" aria-label="Download chapter" rel="noreferrer">
                        Download chapter
                      </a>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
