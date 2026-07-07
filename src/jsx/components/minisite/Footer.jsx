import './Footer.css';

const defaultLanguageLinks = [
  { label: 'English', url: 'https://player.vimeo.com/video/1207147620?h=d47f7e3cb6&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479' },
  { label: 'Français', url: 'https://vimeo.com/1207162145' },
  { label: 'Español', url: 'https://vimeo.com/1207162547' },
  { label: 'العربية', url: 'https://vimeo.com/1207162145' },
  { label: '简体中文', url: false },
  { label: 'Русский', url: 'https://vimeo.com/1207162519' },
  { label: 'Português', url: false },
  { label: 'Kiswahili', url: false },
  { label: 'Urdu اردو', url: false },
  { label: 'Indonesia', url: 'https://vimeo.com/1207408013' },
  { label: 'Hindi हिंदी', url: 'https://vimeo.com/1207442608' }
];

const defaultMediaLinks = [
  { label: 'Photos', url: 'https://www.flickr.com/photos/unctad/albums/72177720334583659/' },
  { label: 'Digital assets', url: 'https://trello.com/b/q4FgS85L/wir-2026' }
];

function Footer({ languageLinks = defaultLanguageLinks, launch_event_title = '', launch_event_url = '', mediaLinks = defaultMediaLinks, reportUrl = '', title = '' }) {
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
                <h3 className="anchor_videos">Watch the video</h3>
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
                      {link.url && i > 1 && ', '}
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
            {launch_event_url && (
              <>
                <h4>Watch the launch event</h4>
                <div className="iframe_container iframe_16_9">
                  <iframe allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" frameBorder="0" src={launch_event_url} title={launch_event_title} />
                </div>
                <p>{launch_event_title}</p>
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
