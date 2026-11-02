"use client";

import Link from "next/link";
import { useState } from "react";
import "./clubsite-prototype.css";

type MainTab = "Website" | "Content" | "Settings";
type FeatureKind = "event" | "news" | "custom";
type ContentPanel = "news" | "pages" | "contact";
type SettingsPanel = "identity" | "domain" | "enquiries";

const EVENTS = [
  {
    id: "evt-1",
    title: "CALM Sessions: Night Drive",
    meta: "Sat 14 Nov · 21:00 · Warehouse 7",
    cta: "Get tickets",
  },
  {
    id: "evt-2",
    title: "Artist Spotlight: Mira Vale",
    meta: "Fri 28 Nov · 20:00 · Keys Room",
    cta: "View event",
  },
] as const;

const ARTICLES = [
  {
    id: "news-1",
    title: "Season opener announced",
    meta: "Linked to Night Drive · Draft ready",
  },
  {
    id: "news-2",
    title: "Inside Our Sound",
    meta: "Feature · Published",
  },
] as const;

const ABOUT_BOXES = [
  "Our Story",
  "Events",
  "Artists",
  "Our Sound",
  "Collaborations",
  "The Archive",
] as const;

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="csp-switch"
      onClick={onChange}
    >
      <span className="csp-switch-knob" />
    </button>
  );
}

export default function ClubsitePrototype() {
  const [mainTab, setMainTab] = useState<MainTab>("Website");
  const [featureKind, setFeatureKind] = useState<FeatureKind>("event");
  const [selectedEventId, setSelectedEventId] = useState<string>(EVENTS[0].id);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(ARTICLES[0].id);
  const [showEvents, setShowEvents] = useState(true);
  const [showNews, setShowNews] = useState(true);
  const [showArtists, setShowArtists] = useState(true);
  const [contentPanel, setContentPanel] = useState<ContentPanel>("news");
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("identity");
  const [reviewOpen, setReviewOpen] = useState(false);

  const selectedEvent = EVENTS.find((item) => item.id === selectedEventId) ?? EVENTS[0];
  const selectedArticle =
    ARTICLES.find((item) => item.id === selectedArticleId) ?? ARTICLES[0];

  const hero =
    featureKind === "event"
      ? {
          kicker: "Featured event",
          title: selectedEvent.title,
          meta: selectedEvent.meta,
          cta: selectedEvent.cta,
          media: "Event artwork from existing record",
        }
      : featureKind === "news"
        ? {
            kicker: "Featured article",
            title: selectedArticle.title,
            meta: selectedArticle.meta,
            cta: "Read article",
            media: "Article image / linked event artwork",
          }
        : {
            kicker: "Custom campaign",
            title: "Join the CALM membership",
            meta: "Campaign copy you write yourself",
            cta: "Learn more",
            media: "Custom campaign media",
          };

  return (
    <div className="csp">
      <div className="csp-banner">
        <div className="csp-banner-copy">
          <p className="csp-banner-kicker">Static visualisation</p>
          <p className="csp-banner-title">
            Proposed Clubsite workspace — Website · Content · Settings
          </p>
        </div>
        <div className="csp-banner-actions">
          <Link href="/site" className="csp-banner-link">
            Back to current Site
          </Link>
          <button
            type="button"
            className="csp-banner-link csp-banner-link--solid"
            onClick={() => setReviewOpen(true)}
          >
            Open review & publish
          </button>
        </div>
      </div>

      <header className="csp-toolbar">
        <div className="csp-toolbar-identity">
          <div className="csp-toolbar-title-row">
            <h1 className="csp-toolbar-title">Clubsite</h1>
            <span className="csp-badge csp-badge--draft">Draft prepared</span>
          </div>
          <p className="csp-toolbar-sub">CALM · Auto-built from organisation profile</p>
        </div>
        <div className="csp-toolbar-actions">
          <span className="csp-status">
            <span className="csp-status-dot" aria-hidden="true" />
            Website draft · Domain not connected
          </span>
          <button type="button" className="csp-btn">
            Preview
          </button>
          <button
            type="button"
            className="csp-btn csp-btn--primary"
            onClick={() => setReviewOpen(true)}
          >
            Review & publish
          </button>
        </div>
      </header>

      <nav className="csp-tabs" aria-label="Clubsite areas">
        {(["Website", "Content", "Settings"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className="csp-tab"
            aria-current={mainTab === tab ? "page" : undefined}
            onClick={() => {
              setMainTab(tab);
              setReviewOpen(false);
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="csp-body">
        {mainTab === "Website" ? (
          <>
            <p className="csp-note">
              <strong>Website:</strong> organiser sees a prepared site immediately, then
              confirms what to feature and what sections to show. No separate Hero form with
              title / subtitle / URLs for the common case.
            </p>

            <div className="csp-website">
              <div className="csp-preview" aria-label="Website preview">
                <div className="csp-preview-bar">
                  <p className="csp-preview-url">preview.y.yourlist / calm</p>
                  <button type="button" className="csp-btn csp-btn--small csp-btn--ghost">
                    Edit header
                  </button>
                </div>
                <div className="csp-preview-frame">
                  <div className="csp-site-header">
                    <div className="csp-site-brand">
                      <div className="csp-site-logo">C</div>
                      <p className="csp-site-name">CALM</p>
                    </div>
                    <ul className="csp-site-nav">
                      <li>Events</li>
                      <li>News</li>
                      <li>Artists</li>
                      <li>About</li>
                    </ul>
                  </div>

                  <div className="csp-hero">
                    <div className="csp-hero-media">
                      <p className="csp-hero-media-label">{hero.media}</p>
                    </div>
                    <div className="csp-hero-copy">
                      <p className="csp-hero-kicker">{hero.kicker}</p>
                      <h2 className="csp-hero-title">{hero.title}</h2>
                      <p className="csp-hero-meta">{hero.meta}</p>
                      <span className="csp-hero-cta">{hero.cta}</span>
                    </div>
                  </div>

                  <div className="csp-feed">
                    {showEvents ? (
                      <div className="csp-feed-block">
                        <h3 className="csp-feed-heading">Upcoming events</h3>
                        {EVENTS.map((event) => (
                          <div key={event.id} className="csp-feed-item">
                            <strong>{event.title}</strong>
                            <span>{event.meta}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {showNews ? (
                      <div className="csp-feed-block">
                        <h3 className="csp-feed-heading">Latest news</h3>
                        {ARTICLES.map((article) => (
                          <div key={article.id} className="csp-feed-item">
                            <strong>{article.title}</strong>
                            <span>{article.meta}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="csp-site-footer">
                    <span>CALM · Contact · Account · My Tickets</span>
                    <span>One logo reused in header & footer</span>
                  </div>
                </div>
              </div>

              <div>
                <section className="csp-panel">
                  <div className="csp-panel-head">
                    <h2 className="csp-panel-title">Homepage feature</h2>
                  </div>
                  <div className="csp-panel-body">
                    <div>
                      <span className="csp-field-label">What would you like to feature?</span>
                      <div className="csp-segment" role="group" aria-label="Feature type">
                        {(
                          [
                            ["event", "Event"],
                            ["news", "News"],
                            ["custom", "Custom"],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={featureKind === id}
                            onClick={() => setFeatureKind(id)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {featureKind === "event" ? (
                      <div className="csp-choice-list">
                        {EVENTS.map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            className="csp-choice"
                            aria-pressed={selectedEventId === event.id}
                            onClick={() => setSelectedEventId(event.id)}
                          >
                            <span className="csp-choice-radio" aria-hidden="true" />
                            <span>
                              <strong>{event.title}</strong>
                              <span>{event.meta}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {featureKind === "news" ? (
                      <div className="csp-choice-list">
                        {ARTICLES.map((article) => (
                          <button
                            key={article.id}
                            type="button"
                            className="csp-choice"
                            aria-pressed={selectedArticleId === article.id}
                            onClick={() => setSelectedArticleId(article.id)}
                          >
                            <span className="csp-choice-radio" aria-hidden="true" />
                            <span>
                              <strong>{article.title}</strong>
                              <span>{article.meta}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {featureKind === "custom" ? (
                      <div className="csp-form-grid">
                        <label>
                          <span className="csp-field-label">Headline</span>
                          <input
                            className="csp-input"
                            defaultValue="Join the CALM membership"
                            readOnly
                          />
                        </label>
                        <label>
                          <span className="csp-field-label">Button label</span>
                          <input className="csp-input" defaultValue="Learn more" readOnly />
                        </label>
                        <p className="csp-note csp-note--flush">
                          Custom is only for campaigns that are not already an event or article.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="csp-panel">
                  <div className="csp-panel-head">
                    <h2 className="csp-panel-title">Sections on this site</h2>
                  </div>
                  <div className="csp-panel-body">
                    <div className="csp-toggle-row">
                      <span>Events feed</span>
                      <Switch
                        checked={showEvents}
                        label="Toggle events feed"
                        onChange={() => setShowEvents((value) => !value)}
                      />
                    </div>
                    <div className="csp-toggle-row">
                      <span>News feed</span>
                      <Switch
                        checked={showNews}
                        label="Toggle news feed"
                        onChange={() => setShowNews((value) => !value)}
                      />
                    </div>
                    <div className="csp-toggle-row">
                      <span>Artists</span>
                      <Switch
                        checked={showArtists}
                        label="Toggle artists"
                        onChange={() => setShowArtists((value) => !value)}
                      />
                    </div>
                    {!showArtists ? (
                      <p className="csp-note csp-note--flush">
                        Hidden sections stay off the public site until you turn them on.
                      </p>
                    ) : null}
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : null}

        {mainTab === "Content" ? (
          <>
            <p className="csp-note">
              <strong>Content:</strong> write news once, manage About boxes, and keep Contact
              ready-made. Events stay in the normal Events module — this area only links to them.
            </p>

            <div className="csp-split">
              <nav className="csp-side-nav" aria-label="Content panels">
                {(
                  [
                    ["news", "News"],
                    ["pages", "Pages · About"],
                    ["contact", "Contact"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-current={contentPanel === id ? "page" : undefined}
                    onClick={() => setContentPanel(id)}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <section className="csp-panel">
                {contentPanel === "news" ? (
                  <>
                    <div className="csp-panel-head">
                      <h2 className="csp-panel-title">Article editor</h2>
                      <button type="button" className="csp-btn csp-btn--small">
                        Publishing options
                      </button>
                    </div>
                    <div className="csp-panel-body">
                      <div className="csp-form-grid">
                        <label>
                          <span className="csp-field-label">Headline</span>
                          <input
                            className="csp-input"
                            defaultValue="Season opener announced"
                            readOnly
                          />
                        </label>
                        <label>
                          <span className="csp-field-label">Article</span>
                          <textarea
                            className="csp-textarea"
                            defaultValue="CALM opens the season with Night Drive at Warehouse 7. Doors at 21:00. Full lineup and ticket details follow from the linked event."
                            readOnly
                          />
                        </label>
                        <div className="csp-form-grid-2">
                          <label>
                            <span className="csp-field-label">Image</span>
                            <input
                              className="csp-input"
                              defaultValue="Reuse event artwork"
                              readOnly
                            />
                          </label>
                          <label>
                            <span className="csp-field-label">Linked event</span>
                            <select className="csp-select" defaultValue={EVENTS[0].id} disabled>
                              {EVENTS.map((event) => (
                                <option key={event.id} value={event.id}>
                                  {event.title}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <p className="csp-note csp-note--flush">
                          Summary, byline and publish time are filled automatically. Advanced
                          overrides live under Publishing options.
                        </p>
                        <div className="csp-review-actions">
                          <button type="button" className="csp-btn">
                            Save draft
                          </button>
                          <button type="button" className="csp-btn csp-btn--primary">
                            Publish article
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                {contentPanel === "pages" ? (
                  <>
                    <div className="csp-panel-head">
                      <h2 className="csp-panel-title">About grid</h2>
                      <button type="button" className="csp-btn csp-btn--small">
                        Optional banner
                      </button>
                    </div>
                    <div className="csp-panel-body">
                      <p className="csp-note csp-note--flush">
                        Prepared CALM structure. Organiser edits the content boxes — large banner
                        is optional and does not block launch.
                      </p>
                      <div className="csp-about-grid">
                        {ABOUT_BOXES.map((box) => (
                          <div key={box} className="csp-about-card">
                            <strong>{box}</strong>
                            <span>Edit content</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {contentPanel === "contact" ? (
                  <>
                    <div className="csp-panel-head">
                      <h2 className="csp-panel-title">Contact page</h2>
                    </div>
                    <div className="csp-panel-body">
                      <p className="csp-note csp-note--flush">
                        Ready-made enquiry form. No field-by-field Include / Required builder for
                        the standard case.
                      </p>
                      <div className="csp-form-grid">
                        <label>
                          <span className="csp-field-label">Form fields</span>
                          <input
                            className="csp-input"
                            defaultValue="Name · Email · Message"
                            readOnly
                          />
                        </label>
                        <label>
                          <span className="csp-field-label">Public contact email shown</span>
                          <input
                            className="csp-input"
                            defaultValue="hello@calm.example"
                            readOnly
                          />
                        </label>
                        <p className="csp-note csp-note--flush">
                          Where submissions are delivered is managed in Settings → Enquiries.
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}
              </section>
            </div>
          </>
        ) : null}

        {mainTab === "Settings" ? (
          <>
            <p className="csp-note">
              <strong>Settings:</strong> identity, domain and enquiry routing live here — not as
              the first step of setup. Domain can stay disconnected while the draft site is
              reviewed.
            </p>

            <div className="csp-split">
              <nav className="csp-side-nav" aria-label="Settings panels">
                {(
                  [
                    ["identity", "Identity"],
                    ["domain", "Domain"],
                    ["enquiries", "Enquiries"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-current={settingsPanel === id ? "page" : undefined}
                    onClick={() => setSettingsPanel(id)}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <section className="csp-panel">
                {settingsPanel === "identity" ? (
                  <>
                    <div className="csp-panel-head">
                      <h2 className="csp-panel-title">Public identity</h2>
                    </div>
                    <div className="csp-panel-body">
                      <dl className="csp-kv">
                        <dt>Public name</dt>
                        <dd>CALM</dd>
                        <dt>Primary logo</dt>
                        <dd>Inherited from organisation · reused everywhere</dd>
                        <dt>Navigation</dt>
                        <dd>Events · News · Artists · About</dd>
                        <dt>Public contact</dt>
                        <dd>hello@calm.example</dd>
                      </dl>
                      <p className="csp-note csp-note--flush">
                        Change only what differs for this site. Private account email is not used
                        as the public contact address.
                      </p>
                    </div>
                  </>
                ) : null}

                {settingsPanel === "domain" ? (
                  <>
                    <div className="csp-panel-head">
                      <h2 className="csp-panel-title">Domain connection</h2>
                    </div>
                    <div className="csp-panel-body">
                      <div className="csp-domain-state">
                        <strong>Not connected</strong>
                        <span>
                          Private preview is available now. Connect a custom domain when you are
                          ready to go live on your own address.
                        </span>
                      </div>
                      <label>
                        <span className="csp-field-label">Custom domain</span>
                        <input
                          className="csp-input"
                          placeholder="www.calm.example"
                          defaultValue=""
                          readOnly
                        />
                      </label>
                      <button type="button" className="csp-btn">
                        Connect domain
                      </button>
                    </div>
                  </>
                ) : null}

                {settingsPanel === "enquiries" ? (
                  <>
                    <div className="csp-panel-head">
                      <h2 className="csp-panel-title">Enquiry routing</h2>
                    </div>
                    <div className="csp-panel-body">
                      <div className="csp-form-grid">
                        <label>
                          <span className="csp-field-label">Contact form</span>
                          <input className="csp-input" defaultValue="Enabled" readOnly />
                        </label>
                        <label>
                          <span className="csp-field-label">Send enquiries to</span>
                          <input
                            className="csp-input"
                            defaultValue="enquiries@calm.example"
                            readOnly
                          />
                        </label>
                        <p className="csp-note csp-note--flush">
                          Public display email and receiving inbox stay separate on purpose.
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}
              </section>
            </div>
          </>
        ) : null}

        {reviewOpen ? (
          <section className="csp-review" aria-label="Review and publish">
            <h2 className="csp-review-title">Review before publish</h2>
            <ul className="csp-review-list">
              <li>Identity prepared from CALM organisation profile</li>
              <li>
                Homepage features:{" "}
                {featureKind === "event"
                  ? selectedEvent.title
                  : featureKind === "news"
                    ? selectedArticle.title
                    : "Custom campaign"}
              </li>
              <li>
                Visible sections:{" "}
                {[
                  showEvents ? "Events" : null,
                  showNews ? "News" : null,
                  showArtists ? "Artists" : null,
                  "About",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </li>
              <li>Domain still not connected — private preview can publish first</li>
              <li>Draft articles stay private until published separately</li>
            </ul>
            <div className="csp-review-actions">
              <button
                type="button"
                className="csp-btn"
                onClick={() => setReviewOpen(false)}
              >
                Keep editing
              </button>
              <button type="button" className="csp-btn csp-btn--primary">
                Publish website changes
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
