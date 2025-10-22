import ScrollContainer from "../../layouts/ScrollContainer";
import Loader from "../../components/Loader"; // make sure this path is correct
import { LazyLoadImage } from '@tjoskar/react-lazyload-img'

export default function Home({ data, loading }) {

  const excludedSections = ["Quick picks", "Trending in Shorts", "Top music videos", "Music videos for you"]; // 👈 add more as needed
  return (
    <div className="h-full">
      {loading ? (
        <div className="flex items-center justify-center min-h-full">
          <Loader />
        </div>
      ) : (
        data
         .filter((section) => !excludedSections.includes(section.title))
          .map((section, index) => (
            <ScrollContainer key={index} title={section.title}>
              {section.contents?.map((item, i) => (
                <div
                  key={item.videoId || item.browseId || i}
                  className="flex-shrink-0 w-46 rounded-lg p-3 
                             hover:bg-[#191919] transition-all cursor-pointer snap-start"
                >
                  <LazyLoadImage
                    image={item.thumbnails?.[2]?.url || item.thumbnails?.[0]?.url}
                    alt={item.title}
                    className="rounded-lg mb-3 w-44 max-h-44 object-cover"
                  />
                  <h3 className="text-base font-semibold truncate">{item.title}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {item.type == "Album" ? "Album" : item.description}
                  </p>
                </div>
              ))}
            </ScrollContainer>
          ))
      )}
    </div>
  );
}