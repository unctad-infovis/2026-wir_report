import './Footer.css';

const defaultLanguageLinks = [
  { label: 'English', url: false },
  { label: 'Français', url: false },
  { label: 'Español', url: false },
  { label: 'العربية', url: false },
  { label: '简体中文', url: false },
  { label: 'Русский', url: false },
  { label: 'Português', url: false },
  { label: 'Kiswahili', url: false },
  { label: 'Urdu اردو', url: false },
  { label: 'Hindi हिंदी', url: false }
];

const defaultMediaLinks = [
  { label: 'Photos', url: false },
  { label: 'Digital assets', url: false }
];

function Footer({ languageLinks = defaultLanguageLinks, launchEventTitle = '', launchEventUrl = '', mediaLinks = defaultMediaLinks, reportUrl = '', title = '' }) {
  return (
    <div className="footer_container">
      <h2>What do you want to do next?</h2>
      <div className="footer_download">
        <a href={reportUrl} target="_blank" rel="noreferrer">
          Download the full report
        </a>
      </div>
      <div className="footer_elements">
        <div className="footer_element">
          <div className="footer_content">
            {languageLinks[0].url && (
              <>
                <h3>Watch the video</h3>
                <div className="iframe_container iframe_16_9">
                  <iframe allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" frameBorder="0" src={languageLinks[0].url} title={title}></iframe>
                </div>
              </>
            )}
            {languageLinks.length > 0 && (
              <ul className="language_links">
                <li>
                  {languageLinks.map((link, i) => (
                    <span key={link.label}>
                      {link.url && i > 0 && ', '}
                      {link.url && i > 0 && (
                        <a href={link.url} target="_blank" rel="noreferrer">
                          {link.label}
                        </a>
                      )}
                    </span>
                  ))}
                </li>
              </ul>
            )}
            {launchEventUrl && (
              <>
                <h4>Watch the launch event</h4>
                <div className="iframe_container iframe_16_9">
                  <iframe allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" frameBorder="0" src={launchEventUrl} title={launchEventTitle} />
                </div>
                <p>{launchEventTitle}</p>
              </>
            )}
            {mediaLinks.length > 0 && (
              <div>
                {(defaultMediaLinks[0].url !== false || defaultMediaLinks[1].url !== false) && <h4>Media assets</h4>}
                <ul>
                  {mediaLinks.map(link => (
                    <li key={link.label}>
                      {link.url !== false && (
                        <a href={link.url} target="_blank" rel="noreferrer">
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
