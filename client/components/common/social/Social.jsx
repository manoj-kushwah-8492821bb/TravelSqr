const Social = (props) => {
  // const socialContent = [
  //   { id: 1, icon: "icon-facebook", link: "https://facebok.com/" },
  //   { id: 2, icon: "icon-twitter", link: "https://twitter.com/" },
  //   { id: 3, icon: "icon-instagram", link: "https://instagram.com/" },
  //   { id: 4, icon: "icon-linkedin", link: "https://linkedin.com/" },
  // ];
  return (
    <>
      {/* {socialContent.map((item) => (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          key={item.id}
        >
          <i className={`${item.icon} text-14`} />
        </a>
      ))} */}
      
      <a
        href={props?.contactData?.facebook_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className='icon-facebook text-14' />
      </a>
      <a
        href={props?.contactData?.twitter_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className='icon-twitter text-14' />
      </a>
      <a
        href={props?.contactData?.instagram_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className='icon-instagram text-14' />
      </a>
      <a
        href={props?.contactData?.linkedin_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className='icon-linkedin text-14' />
      </a>
    </>
  );
};

export default Social;
