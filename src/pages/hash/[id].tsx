import Layout from "@/components/Layout"
import { supabase } from "@/lib/supabase"
import Image from "next/image";
import { Cast } from "@/interfaces/cast";
import { GetServerSidePropsContext } from "next";

type CardProps = {
  cast: Cast;
};

type HashProps = {
  data: [Cast];
};

const Card = ({ cast }: CardProps) => {
    return (
    <center>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-[30vw] mt-[15vh]">
        <div className="p-4">
          <h2 className="font-bold text-xl mb-2 inline-block">{cast.author_display_name}</h2>
          <p className="font-normal text-xs text-gray-900 inline-block ml-2">@{cast.author_username}</p>
          <p className="text-gray-700 text-base">{cast.text}</p>
          <div className="mt-4 flex items-center">
            <Image
              width={56}
              height={56}
              className="w-10 h-10 object-cover object-center rounded-full mr-2"
              src={cast.author_pfp_url}
              alt="Author Profile Picture"
            />
            <div>
              <p className="text-sm text-gray-700">{cast.published_at}</p>
            </div>
          </div>
        </div>
      </div>
    </center>
    );
  };

function Hash({ data }: HashProps) {
    return(
    <Layout>
        <Card cast={data[0]} />
    </Layout>
    )
  }
  
  // This gets called on every request
  export async function getServerSideProps(context: GetServerSidePropsContext) {
    const id = context.params?.id
    // Fetch data from external API
    const { data, error } = await supabase
    .from('casts')
    .select()
    .eq('hash', id)  
  
    return { props: { data } }
  }
  
  export default Hash